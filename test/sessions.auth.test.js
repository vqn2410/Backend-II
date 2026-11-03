import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
} from '@jest/globals';
import request from 'supertest';

import app from '../src/app.js';
import { startMongo, stopMongo, clearCollections } from './helpers/mongo.js';

const REGISTER_URL = '/api/sessions/register';
const LOGIN_URL = '/api/sessions/login';
const CURRENT_URL = '/api/sessions/current';

const validUser = {
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'ana@mail.com',
  password: 'Secreta123',
};

const registerUser = (payload = validUser) =>
  request(app).post(REGISTER_URL).send(payload);

beforeAll(startMongo);
afterAll(stopMongo);
afterEach(clearCollections);

describe('POST /api/sessions/login', () => {
  it('autentica un usuario válido, responde 200 y setea una cookie httpOnly', async () => {
    await registerUser();

    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'ana@mail.com', password: 'Secreta123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.payload).toMatchObject({
      first_name: 'Ana',
      last_name: 'Pérez',
      email: 'ana@mail.com',
      role: 'user',
    });
    expect(res.body.payload.id).toBeDefined();
    expect(res.body.payload.password).toBeUndefined();

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toContain('token=');
    expect(setCookie[0]).toContain('HttpOnly');
  });

  it('normaliza el email (trim + lowercase) al autenticar', async () => {
    await registerUser();

    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: '  ANA@Mail.com ', password: 'Secreta123' });

    expect(res.status).toBe(200);
    expect(res.body.payload.email).toBe('ana@mail.com');
  });

  it('devuelve 401 con contraseña incorrecta', async () => {
    await registerUser();

    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'ana@mail.com', password: 'WrongPass123' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Credenciales inválidas',
    });
  });

  it('devuelve 401 con un email no registrado', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'nadie@mail.com', password: 'Secreta123' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Credenciales inválidas',
    });
  });

  it('devuelve 400 si faltan email o contraseña', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'ana@mail.com' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Email y contraseña son obligatorios',
    });
  });
});

describe('GET /api/sessions/current', () => {
  it('devuelve 200 con el perfil del usuario autenticado (cookie)', async () => {
    await registerUser();

    const agent = request.agent(app);
    await agent
      .post(LOGIN_URL)
      .send({ email: 'ana@mail.com', password: 'Secreta123' });

    const res = await agent.get(CURRENT_URL);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.payload).toMatchObject({
      first_name: 'Ana',
      last_name: 'Pérez',
      email: 'ana@mail.com',
      role: 'user',
    });
    expect(res.body.payload.password).toBeUndefined();
  });

  it('devuelve 401 sin cookie de sesión', async () => {
    const res = await request(app).get(CURRENT_URL);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'No autenticado',
    });
  });

  it('devuelve 401 con un token inválido', async () => {
    const res = await request(app)
      .get(CURRENT_URL)
      .set('Cookie', 'token=token.invalido.abc');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Token inválido o expirado',
    });
  });
});
