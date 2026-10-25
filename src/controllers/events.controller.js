import eventsService from '../services/events.service.js';

export class EventsController {
  async getEvents(req, res, next) {
    try {
      const events = await eventsService.getAllEvents();
      return res.status(200).json({
        status: 'success',
        payload: events,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eventsController = new EventsController();
export default eventsController;
