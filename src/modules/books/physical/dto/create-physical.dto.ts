import { createZodDto } from 'nestjs-zod';
import { createPhysicalCopySchema } from '../../../../shared/index.js';

export class CreatePhysicalDto extends createZodDto(createPhysicalCopySchema) {}
