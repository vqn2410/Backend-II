import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';

const router = Router();

// Rutas base iniciales de sessions (sin lógica de auth por el momento)
router.post('/register', sessionsController.register);
router.post('/login', sessionsController.login);
router.get('/current', sessionsController.current);

export default router;
