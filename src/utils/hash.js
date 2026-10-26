import bcrypt from 'bcrypt';

// Número de rondas de sal para bcrypt (mayor valor = más seguro pero más lento)
const SALT_ROUNDS = 10;

/**
 * Hashea una contraseña en texto plano usando bcrypt.
 * @param {string} plainPassword - Contraseña en texto plano.
 * @returns {Promise<string>} Contraseña hasheada.
 */
export const hashPassword = (plainPassword) =>
  bcrypt.hash(plainPassword, SALT_ROUNDS);

/**
 * Compara una contraseña en texto plano con su hash almacenado.
 * @param {string} plainPassword - Contraseña ingresada por el usuario.
 * @param {string} hashedPassword - Hash almacenado en la base de datos.
 * @returns {Promise<boolean>} true si coinciden, false en caso contrario.
 */
export const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

export default { hashPassword, comparePassword };
