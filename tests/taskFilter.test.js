import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SourceTextModule, SyntheticModule } from 'node:vm';

async function loadFile(file, importedModules) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const mod = new SourceTextModule(source, { identifier: file });

  await mod.link(async (specifier) => {
    const exports = importedModules[specifier];
    assert.ok(exports, `Missing test stub: ${specifier}`);
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) {
        this.setExport(name, value);
      }
    });
  });

  await mod.evaluate();
  return mod.namespace;
}

function mockResponse() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

const chain = {};
for (const method of ['isString', 'withMessage', 'bail', 'trim', 'notEmpty',
  'isEmail', 'normalizeEmail', 'optional', 'isIn', 'isInt', 'isBoolean',
  'isLength', 'escape', 'exists']) {
  chain[method] = () => chain;
}
const validatorStubs = {
  'express-validator': {
    body: () => chain,
    oneOf: () => chain,
    param: () => chain,
    validationResult: () => ({ isEmpty: () => true }),
  },
};

test('GET query validation allows no parameter, true, and false', async () => {
  const { validateCompletedQuery } = await loadFile('src/middleware/validators.js', validatorStubs);
  for (const value of [undefined, 'true', 'false']) {
    const res = mockResponse();
    let nextCalled = false;
    validateCompletedQuery({ query: { completed: value } }, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true, String(value));
    assert.equal(res.statusCode, 200);
  }
});

test('GET query validation rejects invalid, uppercase, and repeated values', async () => {
  const { validateCompletedQuery } = await loadFile('src/middleware/validators.js', validatorStubs);
  for (const value of ['invalid', 'True', '1', '', ['true', 'false']]) {
    const res = mockResponse();
    let nextCalled = false;
    validateCompletedQuery({ query: { completed: value } }, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, { errors: ['completed must be true or false'] });
  }
});

test('repository applies true and false without dropping the user ID', async () => {
  const calls = [];
  const repo = await loadFile('src/repositories/taskRepo.js', {
    '../config/db.js': {
      default: { task: { findMany: async (args) => { calls.push(args); return []; } } },
    },
  });
  await repo.findByUserId(7);
  await repo.findByUserId(7, true);
  await repo.findByUserId(7, false);
  assert.deepEqual(calls, [
    { where: { userId: 7 } },
    { where: { userId: 7, completed: true } },
    { where: { userId: 7, completed: false } },
  ]);
});

test('repository also filters admin all-tasks queries', async () => {
  const calls = [];
  const repo = await loadFile('src/repositories/taskRepo.js', {
    '../config/db.js': {
      default: { task: { findMany: async (args) => { calls.push(args); return []; } } },
    },
  });
  await repo.findAll();
  await repo.findAll(true);
  await repo.findAll(false);
  assert.deepEqual(calls, [undefined, { where: { completed: true } }, { where: { completed: false } }]);
});

test('service passes completed through to the repository', async () => {
  const calls = [];
  const repoStub = {
    create: async () => ({}),
    findByUserId: async (...args) => { calls.push(['user', ...args]); return []; },
    findAll: async (...args) => { calls.push(['all', ...args]); return []; },
    findById: async () => null,
    updateById: async () => null,
    deleteById: async () => null,
  };
  const service = await loadFile('src/services/taskService.js', {
    '../repositories/taskRepo.js': repoStub,
  });
  await service.findTasksByUserId(8, false);
  await service.findAllTasks(true);
  assert.deepEqual(calls, [['user', 8, false], ['all', true]]);
});

test('controller turns the query strings into booleans', async () => {
  const calls = [];
  const serviceStub = {
    createTask: async () => ({}),
    findAllTasks: async (...args) => { calls.push(['all', ...args]); return []; },
    findTasksByUserId: async (...args) => { calls.push(['user', ...args]); return []; },
    findTaskById: async () => ({}),
    updateTaskById: async () => ({}),
    deleteTaskById: async () => ({}),
  };
  const controller = await loadFile('src/controllers/taskController.js', {
    '../services/taskService.js': serviceStub,
  });
  for (const completed of [undefined, 'true', 'false']) {
    const res = mockResponse();
    await controller.getMyTasksHandler({ query: { completed }, user: { id: 4 } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, []);
  }
  await controller.getAllTasksHandler({ query: { completed: 'false' } }, mockResponse());
  assert.deepEqual(calls, [
    ['user', 4, undefined],
    ['user', 4, true],
    ['user', 4, false],
    ['all', false],
  ]);
});
