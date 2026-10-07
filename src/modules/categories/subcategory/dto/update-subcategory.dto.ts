import { createZodDto } from "nestjs-zod";
import { UpdateSubCategorySchema } from '../../../../shared/index.js';

export class UpdateSubcategoryDto extends createZodDto(UpdateSubCategorySchema) {}
