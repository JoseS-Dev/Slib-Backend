import { createZodDto } from "nestjs-zod";
import { CreateBookSchema } from '../../../../shared/index.js';

export class CreateBookDto extends createZodDto(CreateBookSchema) {}
