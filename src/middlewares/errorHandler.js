/**
 * Extrae el nombre del campo que provocó una colisión de índice único
 * a partir de un error E11000 de MongoDB/Mongoose.
 * @param {object} err - Error de clave duplicada (code 11000).
 * @returns {string|null} Nombre del campo duplicado (p. ej. 'email') o null.
 */
const getDuplicatedField = (err) => {
  const key = err?.keyValue ?? err?.keyPattern ?? {};
  const [field] = Object.keys(key);
  return field ?? null;
};

// Middleware global de manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err);

  // Colisión de índice único (p. ej. dos registros concurrentes con el mismo email).
  // Mongoose/MongoDB la reportan con code === 11000; se mapea a 409 Conflict
  // en lugar de un 500 para que el cliente pueda reaccionar adecuadamente.
  if (err?.code === 11000) {
    const field = getDuplicatedField(err);
    const message = field
      ? `Ya existe un registro con ese ${field}`
      : 'El recurso ya existe';

    return res.status(409).json({
      status: 'error',
      message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};

export default errorHandler;
