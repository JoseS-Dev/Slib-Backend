import { createZodDto } from "nestjs-zod";
import { CreateSubCategorySchema } from '../../../../shared/index.js';

export class CreateSubcategoryDto extends createZodDto(CreateSubCategorySchema) {}
