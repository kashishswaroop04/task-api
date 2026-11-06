import express from 'express';
import { signUpHandler, logInHandler } from '../controllers/authController.js';
import { validateSignUp, validateLogIn } from '../middleware/validators.js';
const router = express.Router();

router.post('/signup', validateSignUp, signUpHandler);
router.post('/login', validateLogIn, logInHandler);

export default router;
