import { createZodDto } from "nestjs-zod";
import { createFavoriteSchema } from '../../../../shared/dtos/index.js'

export class CreateFavoriteDto extends createZodDto(createFavoriteSchema) {}
