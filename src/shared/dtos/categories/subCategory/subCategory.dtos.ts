import z from 'zod';

// Esquema de validación de las subcategorias
export const subCategorySchema = z.object({
  id: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export const CreateSubCategorySchema = subCategorySchema.omit({ id: true });
export const UpdateSubCategorySchema = CreateSubCategorySchema.partial();
