import z from 'zod';


// Defino el esquema de validación de los usuarios
export const userSchema = z.object({
    id: z.number().int().positive(),
    roleId: z.number().int().positive(),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    userName: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(8),
    phoneNumber: z.string().max(11).optional()
});

export const createUserDto = userSchema.omit({id: true, roleId: true});
export const createUserAdminDto = userSchema.omit({id: true, password: true});

export const updateUserDto = userSchema.partial()