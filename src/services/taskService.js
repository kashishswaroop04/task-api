import {
  create,
  findByUserId,
  findAll,
  findById,
  updateById,
  deleteById,
} from '../repositories/taskRepo.js'

export async function createTask(taskData) {
  return create(taskData);
}

export async function findTasksByUserId(userId, completed) {
  return findByUserId(userId, completed);
}

export async function findAllTasks(completed) {
  return findAll(completed);
}

export async function findTaskById(id) {
  const task = await findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return task;
}

export async function updateTaskById(id, updatedData) {
  const task = await updateById(id, updatedData);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return task;
}

export async function deleteTaskById(id) {
  const task = await deleteById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
}
