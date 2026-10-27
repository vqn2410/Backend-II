import eventsRepository from '../repositories/events.repository.js';

export class EventsService {
  /**
   * Obtiene todos los eventos consultando al repositorio.
   * @returns {Promise<Array>} Lista de eventos.
   */
  async getAllEvents() {
    return eventsRepository.getAll();
  }
}

export const eventsService = new EventsService();
export default eventsService;
