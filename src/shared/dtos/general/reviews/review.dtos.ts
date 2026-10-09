import z from 'zod';

// Esquema de validación para la creación de una reseña para un libro
const reviewSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    bookId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1).max(500).optional(),
    isActive: z.boolean().optional(),
});

export const createReviewSchema = reviewSchema.omit({ id: true, isActive: true  });
export const updateReviewSchema = reviewSchema.partial().omit({ id: true, userId: true, bookId: true });