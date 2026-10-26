import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // select: false evita que la contraseña se devuelva por defecto en las consultas.
      // Para leerla explícitamente (p. ej. en el futuro login) se usa .select('+password').
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        // Expone 'id' (string) en lugar de '_id' y elimina la contraseña.
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel = model('User', userSchema);
export default UserModel;
