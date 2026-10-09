import { createZodDto } from 'nestjs-zod';
import { UpdateBookSchema } from '../../../../shared/index.js';

export class UpdateBookDto extends createZodDto(UpdateBookSchema) {}
