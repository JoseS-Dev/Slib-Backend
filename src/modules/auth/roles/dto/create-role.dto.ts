import { createZodDto } from 'nestjs-zod';
import { createRoleDto } from '../../../../shared/index.js';

export class CreateRoleDto extends createZodDto(createRoleDto) {}
