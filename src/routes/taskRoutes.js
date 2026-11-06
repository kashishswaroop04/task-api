import express from 'express';
import {
    createTaskHandler,
    getMyTasksHandler,
    getTaskByIdHandler,
    updateTaskByIdHandler,
    deleteTaskByIdHandler,
} from '../controllers/taskController.js';
import { authenticate, requireTaskOwnership } from '../middleware/auth.js';
import {
    validateCreateTask,
    validateUpdateTask,
    validateId,
    validateCompletedQuery,
} from '../middleware/validators.js';

const router = express.Router();
router.use(authenticate);

router.get('/', validateCompletedQuery, getMyTasksHandler);
router.post('/', validateCreateTask, createTaskHandler);
router.get('/:id', validateId, requireTaskOwnership, getTaskByIdHandler);
router.put(
    '/:id',
    validateId,
    validateUpdateTask,
    requireTaskOwnership,
    updateTaskByIdHandler,

);
router.delete('/:id', validateId, requireTaskOwnership, deleteTaskByIdHandler);

export default router;
