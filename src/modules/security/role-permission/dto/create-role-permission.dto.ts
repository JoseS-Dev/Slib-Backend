import { createZodDto } from 'nestjs-zod';
import { createRolePermissionDto } from '../../../../shared/index.js';

export class CreateRolePermissionDto extends createZodDto(
  createRolePermissionDto,
) {}
