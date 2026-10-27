import EventModel from '../models/Event.js';

// Capa DAO (Data Access Object): Operaciones directas sobre la base de datos
export class EventsDAO {
  /**
   * Obtiene todos los eventos de la base de datos.
   * @returns {Promise<Array>} Lista de eventos.
   */
  async getAll() {
    return EventModel.find().lean();
  }
}

export const eventsDAO = new EventsDAO();
export default eventsDAO;
