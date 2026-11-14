import usersRepository from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { httpError, toPublicUser } from '../utils/index.js';

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

    // 1. Normalizar entradas (trim + lowercase) ANTES de validar presencia,
    //    para que un string compuesto solo por espacios sea rechazado con 400
    //    y no llegue a fallar recién en la validación de Mongoose (que daría 500).
    const firstName = String(first_name ?? '').trim();
    const lastName = String(last_name ?? '').trim();
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    const plainPassword = String(password ?? '');

    // 2. Validar presencia de campos obligatorios (rechaza vacíos y solo-espacios)
    if (!firstName || !lastName || !normalizedEmail || !plainPassword) {
      throw httpError(400, 'Faltan campos obligatorios');
    }

    // 3. Validar formato de email
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw httpError(400, 'El email tiene un formato inválido');
    }

    // 4. Validar longitud mínima de contraseña
    if (plainPassword.length < PASSWORD_MIN_LENGTH) {
      throw httpError(
        400,
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      );
    }

    // 5. Rechazar el registro si el email ya existe
    const existingUser = await usersRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw httpError(409, 'El email ya está registrado');
    }

    // 6. Hashear la contraseña con bcrypt (helper reutilizable en utils/)
    const hashedPassword = await hashPassword(plainPassword);

    // 7. Persistir el usuario. El role NO se toma del body: siempre usa el valor por defecto ('user').
    const user = await usersRepository.create({
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 8. Devolver el usuario sin exponer la contraseña (ni en texto plano ni hasheada)
    return toPublicUser(user);
  }

  /**
   * Autentica a un usuario y emite un token JWT.
   * Flujo: normalizar -> buscar con contraseña -> comparar hash -> firmar token.
   * Responde siempre con "Credenciales inválidas" ante email/contraseña que no
   * coincidan, sin especificar cuál de los dos falló.
   * @param {object} credentials - Datos recibidos del body ({ email, password }).
   * @returns {Promise<string>} Token JWT firmado.
   */
  async login(credentials) {
    const { email, password } = credentials ?? {};

    // 1. Normalizar email y validar presencia
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    const plainPassword = String(password ?? '');

    if (!normalizedEmail || !plainPassword) {
      throw httpError(400, 'Email y contraseña son obligatorios');
    }

    // 2. Validar formato de email (misma política que en el registro)
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw httpError(400, 'El email tiene un formato inválido');
    }

    // 3. Buscar el usuario incluyendo el hash de la contraseña (select: false por defecto)
    const user = await usersRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) {
      throw httpError(401, 'Credenciales inválidas');
    }

    // 4. Comparar la contraseña ingresada con el hash almacenado
    const isMatch = await comparePassword(plainPassword, user.password);
    if (!isMatch) {
      throw httpError(401, 'Credenciales inválidas');
    }

    // 5. Firmar el JWT con los datos mínimos necesarios (id, email, role)
    return signToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });
  }
}

export const sessionsService = new SessionsService();
export default sessionsService;
