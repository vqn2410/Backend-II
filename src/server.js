import app from './app.js';
import config from './config/index.js';
import connectDB from './config/database.js';

const PORT = config.port;

const start = async () => {
  // Conectar a la base de datos antes de exponer la API
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` Servidor activo en http://localhost:${PORT}`);
    console.log(` Entorno: ${config.nodeEnv}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Eventos: http://localhost:${PORT}/api/events`);
    console.log(` Sesiones: http://localhost:${PORT}/api/sessions`);
    console.log(`=========================================`);
  });
};

start();
