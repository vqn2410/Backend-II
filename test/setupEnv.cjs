// Configuración de entorno para las suites de test.
// Se carga antes que los módulos (setupFiles de Jest), por lo que el JWT se
// firma/verifica siempre con el mismo secreto en los tests, sin depender del
// archivo .env (que no se sube al repositorio).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-jwt';
process.env.NODE_ENV = 'test';
