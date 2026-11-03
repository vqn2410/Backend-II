import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

/**
 * Levanta una instancia de MongoDB en memoria y conecta Mongoose a ella.
 * Permite correr tests de integración sin una instancia real de MongoDB.
 */
export const startMongo = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
};

/**
 * Desconecta Mongoose y detiene la instancia en memoria.
 */
export const stopMongo = async () => {
  await mongoose.disconnect();
  await mongo.stop();
};

/**
 * Vacía todas las colecciones (manteniendo los índices) entre tests.
 */
export const clearCollections = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
};
