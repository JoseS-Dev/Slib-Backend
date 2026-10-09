import z from 'zod';
import { userSchema } from '../auth/index.js';

// Defino el esquema para el envio de correo electrónico
export const mailerSchema = userSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
});

// Defino el esquema para el reseteo de contraseña
export const resetPasswordSchema = z.object({
  email: userSchema.shape.email,
  newPassword: userSchema.shape.password,
  token: z.string().min(1),
});

export const createMailerSchema = mailerSchema;
export const forgotPasswordSchema = mailerSchema.omit({
  firstName: true,
  lastName: true,
});
