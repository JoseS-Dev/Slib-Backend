import { createZodDto } from "nestjs-zod";
import { itemsSchemaCreate } from '../../../../shared/dtos/index.js'

export class CreateItemDto extends createZodDto(itemsSchemaCreate) {}
