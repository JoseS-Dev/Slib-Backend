import { createZodDto } from 'nestjs-zod';
import { createAuthorSchema } from '../../../../shared/index.js';

export class CreateAuthorDto extends createZodDto(createAuthorSchema) {}
