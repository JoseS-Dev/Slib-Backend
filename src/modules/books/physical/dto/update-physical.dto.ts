import { createZodDto } from 'nestjs-zod';
import { updatePhysicalCopySchema } from '../../../../shared/index.js';

export class UpdatePhysicalDto extends createZodDto(updatePhysicalCopySchema) {}
