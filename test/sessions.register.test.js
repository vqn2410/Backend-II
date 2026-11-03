import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
} from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app.js';
import { startMongo, stopMongo, clearCollections } from './helpers/mongo.js';

// Endpoint bajo prueba
const REGISTER_URL = '/api/sessions/register';

// Usuario base válido. Se normaliza el email y se fuerza `role: 'user'`.
const validUser = {
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'ana@mail.com',
  password: 'Secreta123',
};

beforeAll(startMongo);
afterAll(stopMongo);
afterEach(clearCollections);

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

    // Se consulta directo a la colección para evitar el `select: false` del modelo.
    const stored = await mongoose.connection
      .collection('users')
      .findOne({ email: 'ana@mail.com' });

    expect(stored.password).toBeDefined();
    expect(stored.password).not.toBe(validUser.password);
    expect(stored.password.startsWith('$2')).toBe(true);
  });
});
