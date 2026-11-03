import config from '../config/index.js';
import sessionsService from '../services/sessions.service.js';
import { getTokenMaxAge } from '../utils/jwt.js';

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
      const { user, token } = await sessionsService.login(req.body);

      // Cookie httpOnly: el token no queda accesible desde JavaScript del cliente.
      res.cookie(config.cookieName, token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: getTokenMaxAge(token),
      });

      return res.status(200).json({
        status: 'success',
        payload: user,
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
}

export const sessionsController = new SessionsController();
export default sessionsController;
