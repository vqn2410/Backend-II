import mongoose from 'mongoose';
import config from './index.js';

/**
 * Establece la conexión con MongoDB usando Mongoose.
 * Se invoca antes de levantar el servidor HTTP.
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
