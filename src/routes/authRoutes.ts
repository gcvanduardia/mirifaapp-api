import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/register', register);
export default router;