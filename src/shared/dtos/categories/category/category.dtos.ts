import z from 'zod';
import { subCategorySchema } from '../subCategory/subCategory.dtos.js';

// Esquema de validación de las categorias
export const CategorySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
    subCategories: z.array(subCategorySchema.omit({ id: true, categoryId: true })).optional(),
});

export const CreateCategorySchema = CategorySchema.omit({ id: true });
export const UpdateCategorySchema = CreateCategorySchema.partial();