import { createZodDto } from 'nestjs-zod';
import { updateRoleDto } from '../../../../shared/index.js';

export class UpdateRoleDto extends createZodDto(updateRoleDto) {}
