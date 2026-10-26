import usersDAO from '../dao/users.dao.js';

// Capa de Repositorio: Abstracción entre los servicios y la persistencia (DAO)
export class UsersRepository {
  /**
   * Busca un usuario por su email normalizado.
   * @param {string} email - Email normalizado (trim + lowercase).
   * @returns {Promise<object|null>} Documento del usuario o null.
   */
  async findByEmail(email) {
    return usersDAO.findByEmail(email);
  }

  /**
   * Persiste un nuevo usuario.
   * @param {object} userData - Datos del usuario a guardar.
   * @returns {Promise<object>} Documento del usuario creado.
   */
  async create(userData) {
    return usersDAO.create(userData);
  }
}

export const usersRepository = new UsersRepository();
export default usersRepository;
