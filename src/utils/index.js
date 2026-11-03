// Utilidades y funciones auxiliares compartidas
export const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Crea un error de negocio con un código de estado HTTP asociado.
 * El middleware global de errores (errorHandler) lo transforma en la respuesta.
 * @param {number} statusCode - Código de estado HTTP (p. ej. 400, 401, 409).
 * @param {string} message - Mensaje legible para el cliente.
 * @returns {Error} Error con la propiedad `statusCode`.
 */
export const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Convierte un documento de usuario (Mongoose o lean) en un objeto público
 * sin contraseña ni `_id`: expone `id` como string junto a los campos básicos.
 * @param {object} user - Documento de usuario.
 * @returns {object} Payload público con id, first_name, last_name, email y role.
 */
export const toPublicUser = (user) => {
  const { _id, first_name, last_name, email, role } = user;
  return {
    id: String(_id),
    first_name,
    last_name,
    email,
    role,
  };
};
