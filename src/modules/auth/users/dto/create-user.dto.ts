import { createZodDto } from 'nestjs-zod';
import { createUserDto, createUserAdminDto } from '../../../../shared/index.js';

export class CreateUserDto extends createZodDto(createUserDto) {}
export class CreateAdminUserDto extends createZodDto(createUserAdminDto) {}
