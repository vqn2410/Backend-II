import config from '../config/index.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación: lee la cookie httpOnly `currentUser`, verifica
 * el JWT y expone `req.user` con los datos mínimos del payload (`{ id, email, role }`).
 */
export const authMiddleware = (req, res, next) => {
  // El token viaja exclusivamente en la cookie httpOnly (no accesible desde el cliente).
  const token = req.cookies?.[config.cookieName];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado',
    });
  }

  try {
    const payload = verifyToken(token);

    // Solo se expone el payload mínimo del JWT, nunca la contraseña.
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    // Token inválido o expirado: misma respuesta genérica que sin token.
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado',
    });
  }
};

export default authMiddleware;
