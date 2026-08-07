import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginValidation, registerValidation } from '../validations/authValidation.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getCurrentUser);

export default router;
