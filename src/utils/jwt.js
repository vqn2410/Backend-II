import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Firma un token JWT con la clave secreta configurada.
 * @param {object} payload - Datos a incluir en el token (p. ej. { id, email, role }).
 * @returns {string} Token JWT firmado.
 */
export const signToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

/**
 * Verifica y decodifica un token JWT.
 * Lanza un error (JsonWebTokenError / TokenExpiredError) si es inválido o expiró.
 * @param {string} token - Token JWT a verificar.
 * @returns {object} Payload decodificado.
 */
export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

/**
 * Devuelve la cantidad de milisegundos restantes de vida de un token (para el
 * `maxAge` de la cookie), a partir de su claim `exp`.
 * @param {string} token - Token JWT firmado.
 * @returns {number|undefined} Milisegundos restantes, o undefined si no se puede calcular.
 */
export const getTokenMaxAge = (token) => {
  const { exp } = jwt.decode(token) ?? {};
  if (!exp) return undefined;
  return exp * 1000 - Date.now();
};

export default { signToken, verifyToken, getTokenMaxAge };
