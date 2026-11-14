import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
} from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../src/app.js';
import config from '../src/config/index.js';
import { startMongo, stopMongo, clearCollections } from './helpers/mongo.js';

const REGISTER_URL = '/api/sessions/register';
const LOGIN_URL = '/api/sessions/login';
const CURRENT_URL = '/api/sessions/current';
const LOGOUT_URL = '/api/sessions/logout';

const COOKIE_NAME = 'currentUser';

const validUser = {
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'ana@mail.com',
  password: 'Secreta123',
};

const registerUser = (payload = validUser) =>
  request(app).post(REGISTER_URL).send(payload);

const loginUser = (agent, payload = { email: 'ana@mail.com', password: 'Secreta123' }) =>
  agent.post(LOGIN_URL).send(payload);

beforeAll(startMongo);
afterAll(stopMongo);
afterEach(clearCollections);

describe('POST /api/sessions/login', () => {
  it('autentica, responde 200 con mensaje y setea la cookie httpOnly currentUser', async () => {
    await registerUser();

    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'ana@mail.com', password: 'Secreta123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      message: 'Login correcto',
    });
    expect(res.body.password).toBeUndefined();

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toContain(`${COOKIE_NAME}=`);
    expect(setCookie[0]).toContain('HttpOnly');
    expect(setCookie[0]).toContain('SameSite=Lax');
    expect(setCookie[0]).toContain('Max-Age=3600');
  });

  it('normaliza el email (trim + lowercase) al autenticar', async () => {
    await registerUser();

    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: '  ANA@Mail.com ', password: 'Secreta123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      message: 'Login correcto',
    });
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

  it('devuelve 400 con un email de formato inválido', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'correo-invalido', password: 'Secreta123' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'El email tiene un formato inválido',
    });
  });
});

describe('GET /api/sessions/current', () => {
  it('devuelve 200 con { id, email, role } usando la cookie', async () => {
    await registerUser();

    const agent = request.agent(app);
    await loginUser(agent);

    const res = await agent.get(CURRENT_URL);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.payload).toMatchObject({
      email: 'ana@mail.com',
      role: 'user',
    });
    expect(res.body.payload.id).toBeDefined();
    expect(res.body.payload.password).toBeUndefined();
    expect(res.body.payload.first_name).toBeUndefined();
    expect(res.body.payload.last_name).toBeUndefined();
  });

  it('devuelve 401 sin cookie de sesión', async () => {
    const res = await request(app).get(CURRENT_URL);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: 'error',
      message: 'No autenticado',
    });
  });

  it('devuelve 401 con un token inválido', async () => {
    const res = await request(app)
      .get(CURRENT_URL)
      .set('Cookie', `${COOKIE_NAME}=token.invalido.abc`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: 'error',
      message: 'No autenticado',
    });
  });

  it('devuelve 401 con un token expirado', async () => {
    const expiredToken = jwt.sign(
      {
        id: '000000000000000000000000',
        email: 'ana@mail.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) - 10,
      },
      config.jwtSecret
    );

    const res = await request(app)
      .get(CURRENT_URL)
      .set('Cookie', `${COOKIE_NAME}=${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: 'error',
      message: 'No autenticado',
    });
  });
});

describe('POST /api/sessions/logout', () => {
  it('cierra sesión, borra la cookie y deja /current en 401', async () => {
    await registerUser();

    const agent = request.agent(app);
    await loginUser(agent);

    const res = await agent.post(LOGOUT_URL);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      message: 'Sesión cerrada',
    });

    const after = await agent.get(CURRENT_URL);
    expect(after.status).toBe(401);
    expect(after.body).toEqual({
      status: 'error',
      message: 'No autenticado',
    });
  });

  it('responde confirmación aunque no exista sesión previa', async () => {
    const res = await request(app).post(LOGOUT_URL);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      message: 'Sesión cerrada',
    });
  });
});
