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

export default { signToken, verifyToken };
