import usersRepository from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';

// Expresión regular sencilla para validar el formato de un email.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export class SessionsService {
  /**
   * Registra un nuevo usuario en la plataforma.
   * Flujo: validar -> normalizar -> verificar duplicados -> hashear -> persistir.
   * @param {object} userData - Datos recibidos del body (first_name, last_name, email, password).
   * @returns {Promise<object>} Usuario creado SIN la contraseña.
   */
  async register(userData) {
    const { first_name, last_name, email, password } = userData ?? {};

    // 1. Validar presencia de campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      throw this.httpError(400, 'Faltan campos obligatorios');
    }

    // 2. Normalizar el email (trim + lowercase) antes de cualquier validación y guardado
    const normalizedEmail = String(email).trim().toLowerCase();

    // 3. Validar formato de email
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw this.httpError(400, 'El email tiene un formato inválido');
    }

    // 4. Validar longitud mínima de contraseña
    if (String(password).length < PASSWORD_MIN_LENGTH) {
      throw this.httpError(
        400,
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      );
    }

    // 5. Rechazar el registro si el email ya existe
    const existingUser = await usersRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw this.httpError(409, 'El email ya está registrado');
    }

    // 6. Hashear la contraseña con bcrypt (helper reutilizable en utils/)
    const hashedPassword = await hashPassword(String(password));

    // 7. Persistir el usuario. El role NO se toma del body: siempre usa el valor por defecto ('user').
    const user = await usersRepository.create({
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 8. Devolver el usuario sin exponer la contraseña (ni en texto plano ni hasheada)
    return this.toPublicUser(user);
  }

  /**
   * Convierte un documento de usuario en un objeto público sin contraseña.
   * @param {object} user - Documento de Mongoose.
   * @returns {object} Payload público con id (string), first_name, last_name, email y role.
   */
  toPublicUser(user) {
    const { _id, first_name, last_name, email, role } = user;
    return {
      id: _id.toString(),
      first_name,
      last_name,
      email,
      role,
    };
  }

  /**
   * Crea un error de negocio con un código de estado HTTP asociado.
   * El middleware global de errores (errorHandler) lo transforma en la respuesta.
   */
  httpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  async login(credentials) {
    // Pendiente de implementar autenticación y generación de JWT
    return { message: 'Servicio de login pendiente de implementación' };
  }
}

export const sessionsService = new SessionsService();
export default sessionsService;
