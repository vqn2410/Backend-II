import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas de sessions
router.post('/register', sessionsController.register);
router.post('/login', sessionsController.login);
router.get('/current', authMiddleware, sessionsController.current);

export default router;
