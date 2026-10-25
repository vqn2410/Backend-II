export class SessionsService {
  async register(userData) {
    // Pendiente de implementar lógica de registro y hash de contraseña
    return { message: 'Servicio de registro pendiente de implementación' };
  }

  async login(credentials) {
    // Pendiente de implementar autenticación y generación de JWT
    return { message: 'Servicio de login pendiente de implementación' };
  }
}

export const sessionsService = new SessionsService();
export default sessionsService;
