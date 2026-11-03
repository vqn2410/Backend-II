import config from '../config/index.js';
import usersRepository from '../repositories/users.repository.js';
import { verifyToken } from '../utils/jwt.js';
import { toPublicUser } from '../utils/index.js';

/**
 * Extrae el token de un header `Authorization: Bearer <token>`.
 * @param {string} authorization - Valor del header Authorization.
 * @returns {string|null} Token o null si no corresponde.
 */
const extractBearerToken = (authorization) => {
  if (!authorization || typeof authorization !== 'string') return null;
  if (!authorization.startsWith('Bearer ')) return null;
  return authorization.slice(7).trim() || null;
};

/**
 * Middleware de autenticación: valida el JWT (cookie httpOnly o header Bearer)
 * y expone `req.user` con los datos públicos del usuario autenticado.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.[config.cookieName] ||
      extractBearerToken(req.headers?.authorization);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado',
      });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido o expirado',
      });
    }

    const user = await usersRepository.findById(payload.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    req.user = toPublicUser(user);
    return next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;
