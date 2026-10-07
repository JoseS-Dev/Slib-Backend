import { createZodDto } from "nestjs-zod";
import { UpdateCategorySchema } from '../../../../shared/index.js';

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
