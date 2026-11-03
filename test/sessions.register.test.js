import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
} from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import app from '../src/app.js';

// Endpoint bajo prueba
const REGISTER_URL = '/api/sessions/register';

// Usuario base válido. Se normaliza el email y se fuerza `role: 'user'`.
const validUser = {
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'ana@mail.com',
  password: 'Secreta123',
};

let mongo;

beforeAll(async () => {
  // Base de datos MongoDB en memoria: permite validar el flujo real
  // (incluido el índice único y el error E11000) sin levantar MongoDB a mano.
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  // Limpia las colecciones entre tests para que los emails únicos no interfieran.
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

describe('POST /api/sessions/register', () => {
  it('registra un usuario válido y responde 201 sin exponer la contraseña', async () => {
    const res = await request(app).post(REGISTER_URL).send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.payload).toMatchObject({
      first_name: 'Ana',
      last_name: 'Pérez',
      email: 'ana@mail.com',
      role: 'user',
    });
    expect(res.body.payload.id).toBeDefined();
    expect(res.body.payload.password).toBeUndefined();
    expect(res.body.payload._id).toBeUndefined();
  });

  it('normaliza el email (trim + lowercase) antes de guardar', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, email: '  Ana@Mail.COM  ' });

    expect(res.status).toBe(201);
    expect(res.body.payload.email).toBe('ana@mail.com');
  });

  it('ignora el campo `role` del body y siempre asigna el valor por defecto', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.payload.role).toBe('user');
  });

  it('devuelve 409 cuando el email ya está registrado', async () => {
    await request(app).post(REGISTER_URL).send(validUser);
    const res = await request(app).post(REGISTER_URL).send(validUser);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'El email ya está registrado',
    });
  });

  it('devuelve 400 cuando faltan campos obligatorios', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ first_name: 'Ana' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Faltan campos obligatorios',
    });
  });

  it('devuelve 400 cuando un campo de presencia es solo espacios', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, first_name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Faltan campos obligatorios',
    });
  });

  it('devuelve 400 cuando el email tiene un formato inválido', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, email: 'correo-invalido' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'El email tiene un formato inválido',
    });
  });

  it('devuelve 400 cuando la contraseña es demasiado corta', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, password: '1234567' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'La contraseña debe tener al menos 8 caracteres',
    });
  });

  it('persiste la contraseña hasheada con bcrypt (nunca en texto plano)', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

    // .select('+password') es necesario por el `select: false` del modelo.
    const stored = await mongoose.connection
      .collection('users')
      .findOne({ email: 'ana@mail.com' });

    expect(stored.password).toBeDefined();
    expect(stored.password).not.toBe(validUser.password);
    expect(stored.password.startsWith('$2')).toBe(true);
  });
});
