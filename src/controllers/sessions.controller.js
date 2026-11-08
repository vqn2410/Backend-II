import config from '../config/index.js';
import sessionsService from '../services/sessions.service.js';

export class SessionsController {
  async register(req, res, next) {
    try {
      const user = await sessionsService.register(req.body);
      return res.status(201).json({
        status: 'success',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const token = await sessionsService.login(req.body);

      // Cookie httpOnly: el JWT no queda accesible desde JavaScript del cliente.
      res.cookie(config.cookieName, token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: config.cookieMaxAge,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Login correcto',
      });
    } catch (error) {
      next(error);
    }
  }

  async current(req, res, next) {
    try {
      return res.status(200).json({
        status: 'success',
        payload: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Elimina la cookie de autenticación en el cliente.
      res.clearCookie(config.cookieName);

      return res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const sessionsController = new SessionsController();
export default sessionsController;
