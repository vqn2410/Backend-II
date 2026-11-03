import { describe, it, expect, jest } from '@jest/globals';

import errorHandler from '../src/middlewares/errorHandler.js';

/**
 * Crea un objeto `res` mínimo con la misma interfaz que usa el errorHandler
 * (res.status().json()) para poder inspeccionar el resultado sin levantar HTTP.
 */
const mockResponse = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

describe('errorHandler (middleware global de errores)', () => {
  beforeEach(() => {
    // Silencia el log de consola para no ensuciar la salida de los tests.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mapea un error E11000 (clave duplicada) a 409 en vez de 500', () => {
    const err = new Error(
      'E11000 duplicate key error collection: eventos_db.users index: email_1 dup key: { email: "ana@mail.com" }'
    );
    err.code = 11000;
    err.keyPattern = { email: 1 };
    err.keyValue = { email: 'ana@mail.com' };

    const res = mockResponse();
    const next = jest.fn();

    errorHandler(err, {}, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ status: 'error' });
    expect(res.body.message).toContain('email');
  });

  it('mapea un error E11000 sin campo identificable a 409 con mensaje genérico', () => {
    const err = new Error('E11000 duplicate key error');
    err.code = 11000;

    const res = mockResponse();
    errorHandler(err, {}, res, jest.fn());

    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ status: 'error' });
    expect(res.body.message).toBe('El recurso ya existe');
  });

  it('preserva el statusCode de los errores de negocio (p. ej. 400)', () => {
    const err = new Error('Faltan campos obligatorios');
    err.statusCode = 400;

    const res = mockResponse();
    errorHandler(err, {}, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Faltan campos obligatorios',
    });
  });

  it('usa 500 como valor por defecto para errores sin statusCode', () => {
    const err = new Error('Error inesperado');

    const res = mockResponse();
    errorHandler(err, {}, res, jest.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Error inesperado',
    });
  });
});
