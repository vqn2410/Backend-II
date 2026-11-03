import UserModel from '../models/User.js';

// Capa DAO (Data Access Object): Operaciones directas sobre la base de datos
export class UsersDAO {
  /**
   * Busca un usuario por su email normalizado.
   * @param {string} email - Email normalizado (trim + lowercase).
   * @returns {Promise<object|null>} Documento del usuario o null.
   */
  async findByEmail(email) {
    return UserModel.findOne({ email }).lean();
  }

  /**
   * Busca un usuario por su id, sin exponer la contraseña (select: false).
   * @param {string} id - Identificador del usuario.
   * @returns {Promise<object|null>} Documento del usuario o null.
   */
  async findById(id) {
    return UserModel.findById(id).lean();
  }

  /**
   * Busca un usuario por su email normalizado INCLUYENDO la contraseña.
   * Uso exclusivo en el login para comparar el hash con `comparePassword`.
   * @param {string} email - Email normalizado (trim + lowercase).
   * @returns {Promise<object|null>} Documento del usuario con password o null.
   */
  async findByEmailWithPassword(email) {
    return UserModel.findOne({ email }).select('+password').lean();
  }

  /**
   * Persiste un nuevo usuario en la base de datos.
   * @param {object} userData - Datos del usuario a guardar.
   * @returns {Promise<object>} Documento del usuario creado.
   */
  async create(userData) {
    return UserModel.create(userData);
  }
}

export const usersDAO = new UsersDAO();
export default usersDAO;
