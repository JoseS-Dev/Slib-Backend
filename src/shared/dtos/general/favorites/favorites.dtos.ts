import z from 'zod';

// Esquema de validación para crear un favorito
const favoriteSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  bookId: z.number().int().positive(),
});

export const createFavoriteSchema = favoriteSchema.omit({ id: true });
export const updateFavoriteSchema = favoriteSchema.partial().omit({ id: true, userId: true, bookId: true }).extend({
    isActive: z.boolean().optional(),
});