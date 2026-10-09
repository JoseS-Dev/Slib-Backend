import { createZodDto } from 'nestjs-zod';
import { createPermissionDto } from '../../../../shared/index.js';

export class CreatePermissionDto extends createZodDto(createPermissionDto) {}
