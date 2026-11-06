import {
  createTask,
  findAllTasks,
  findTasksByUserId,
  findTaskById,
  updateTaskById,
  deleteTaskById,
} from '../services/taskService.js';

export async function createTaskHandler(req, res) {
  const taskData = {
    ...req.body,
    userId: req.user.id,
  };
  const newTask = await createTask(taskData);
  res.status(201).json(newTask);
}

export async function getAllTasksHandler(req, res) {
  const completed = req.query.completed === undefined
    ? undefined
    : req.query.completed === 'true';
  const tasks = await findAllTasks(completed);
  res.status(200).json(tasks);
}

export async function getMyTasksHandler(req, res) {
  const completed = req.query.completed === undefined
    ? undefined
    : req.query.completed === 'true';
  const tasks = await findTasksByUserId(req.user.id, completed);
  res.status(200).json(tasks);
}

export async function getTaskByIdHandler(req, res) {
  const id = parseInt(req.params.id);
  const task = await findTaskById(id);
  res.status(200).json(task);
}

export async function updateTaskByIdHandler(req, res) {
  const id = parseInt(req.params.id);
  const updatedTask = await updateTaskById(id, req.body);
  res.status(200).json(updatedTask);
}

export async function deleteTaskByIdHandler(req, res) {
  const id = parseInt(req.params.id);
  await deleteTaskById(id);
  res.status(204).send();
}
