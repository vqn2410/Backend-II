import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/eventos_db',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  cookieName: process.env.COOKIE_NAME || 'token',
};

export default config;
