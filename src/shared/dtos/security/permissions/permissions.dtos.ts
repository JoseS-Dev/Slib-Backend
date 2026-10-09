import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { roleSchema } from '../../auth/roles/roles.dtos.js';

// Defino el esquema base de los permisos
export const permissionSchema = z.object({
  id: roleSchema.shape.id,
  name: roleSchema.shape.name,
  description: z.string().optional(),
});

export const createPermissionDto = permissionSchema.omit({ id: true });
export const updatePermissionDto = createPermissionDto.partial();
