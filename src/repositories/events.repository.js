import eventsDAO from '../dao/events.dao.js';

// Capa de Repositorio: Abstracción entre los servicios y la persistencia (DAO)
export class EventsRepository {
  /**
   * Obtiene todos los eventos.
   * @returns {Promise<Array>} Lista de eventos.
   */
  async getAll() {
    return eventsDAO.getAll();
  }
}

export const eventsRepository = new EventsRepository();
export default eventsRepository;
