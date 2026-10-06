import z from 'zod';

// Esquema base de validación para los roles
const roleSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(20),
    isDefault: z.boolean().optional(),
    permissionsIds: z.array(z.number().int().positive()).optional(),
});

export const createRoleDto = roleSchema.omit({ id: true })
export const updateRoleDto = roleSchema.partial()