import { createZodDto } from 'nestjs-zod';
import { loginUserDto } from '../../../../shared/index.js';

export class CreateSessionDto extends createZodDto(loginUserDto) {}
