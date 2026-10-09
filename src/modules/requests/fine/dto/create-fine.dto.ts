import { createZodDto } from "nestjs-zod";
import { createFineSchema } from '../../../../shared/dtos/index.js'

export class CreateFineDto extends createZodDto(createFineSchema) {}
