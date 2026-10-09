import { createZodDto } from "nestjs-zod";
import { updateFavoriteSchema } from '../../../../shared/dtos/index.js'

export class UpdateFavoriteDto extends createZodDto(updateFavoriteSchema) {}
