import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/eventos_db',
  // Sin valor por defecto: JWT_SECRET debe venir de las variables de entorno.
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  // Nombre de la cookie httpOnly donde viaja el JWT (fijo según la consigna).
  cookieName: 'currentUser',
  // Vida de la cookie en milisegundos (1 hora), fija según la consigna.
  cookieMaxAge: 3600000,
};

export default config;
