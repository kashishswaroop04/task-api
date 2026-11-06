import jwt from 'jsonwebtoken';
import { findTaskById } from '../services/taskService.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    const authError = new Error('Unauthorized');
    authError.status = 401;
    next(authError);
  }
}

export async function requireTaskOwnership(req, res, next) {
  const id = parseInt(req.params.id);

  try {
    const task = await findTaskById(id);

    if (!task) {
      const error = new Error('Not Found');
      error.status = 404;
      return next(error);
    }

    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      return next(error);
    }

    req.task = task;
    next();
  } catch (error) {
    if (error.status === 404 || error.message === 'Task not found') {
      const notFoundError = new Error('Not Found');
      notFoundError.status = 404;
      return next(notFoundError);
    }

    next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    const error = new Error('Forbidden');
    error.status = 403;
    return next(error);
  }

  next();
}
