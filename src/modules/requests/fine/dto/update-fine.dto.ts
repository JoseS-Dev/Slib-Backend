import { createZodDto } from "nestjs-zod";
import { updateFineSchema } from '../../../../shared/dtos/index.js'

export class UpdateFineDto extends createZodDto(updateFineSchema) {}
