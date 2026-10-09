import { createZodDto } from 'nestjs-zod';
import { updateRequestSchema } from '../../../../shared/index.js';

export class UpdateRequestDto extends createZodDto(updateRequestSchema) {}
