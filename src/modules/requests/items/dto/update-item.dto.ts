import { createZodDto } from "nestjs-zod";
import { updateItemSchema } from '../../../../shared/dtos/index.js'

export class UpdateItemDto extends createZodDto(updateItemSchema) {}
