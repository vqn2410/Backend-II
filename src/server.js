import app from './app.js';
import config from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Servidor activo en http://localhost:${PORT}`);
  console.log(` Entorno: ${config.nodeEnv}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Eventos: http://localhost:${PORT}/api/events`);
  console.log(`=========================================`);
});
