import z from 'zod';
import { roleSchema } from '../../auth/roles/roles.dtos.js';
import { permissionSchema } from '../permissions/permissions.dtos.js';

// Defino ele squema base de la relación entre los permisos y los roles
const rolePermissionSchema = z.object({
    roleId: roleSchema.shape.id,
    permissionId: permissionSchema.shape.id
})

export const createRolePermissionDto = rolePermissionSchema;