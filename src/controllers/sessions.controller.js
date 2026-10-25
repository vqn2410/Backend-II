import sessionsService from '../services/sessions.service.js';

export class SessionsController {
  async register(req, res, next) {
    try {
      const result = await sessionsService.register(req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Endpoint de registro preparado (sin autenticación aún)',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await sessionsService.login(req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Endpoint de login preparado (sin autenticación aún)',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async current(req, res, next) {
    try {
      return res.status(200).json({
        status: 'success',
        message: 'Endpoint de sesión actual preparado',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const sessionsController = new SessionsController();
export default sessionsController;
