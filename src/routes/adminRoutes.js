import express from 'express';
import {
    getAllTasksHandler,
    getTaskByIdHandler,
    updateTaskByIdHandler,
    deleteTaskByIdHandler,
} from '../controllers/taskController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateId, validateUpdateTask, validateCompletedQuery } from '../middleware/validators.js';

const router = express.Router();
router.use(authenticate);
router.use(requireAdmin);

router.get('/', validateCompletedQuery, getAllTasksHandler);
router.get('/:id', validateId, getTaskByIdHandler);
router.put('/:id', validateId, validateUpdateTask, updateTaskByIdHandler);
router.delete('/:id', validateId, deleteTaskByIdHandler);

export default router;
