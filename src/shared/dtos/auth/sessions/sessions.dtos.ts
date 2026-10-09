import z from 'zod';
import { userSchema } from '../users/users.dtos.js';

// Defino el esquema de validación para el inicio de sesión de un usuario
export const loginUserDto = z.object({
  email: userSchema.shape.email,
  password: userSchema.shape.password,
});
