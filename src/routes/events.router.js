import { Router } from 'express';
import eventsController from '../controllers/events.controller.js';

const router = Router();

// GET /api/events
router.get('/', eventsController.getEvents);

export default router;
