import z from 'zod';

// Esquema de validación de los libros
export const BookSchema = z.object({
    id: z.number().int().positive(),
    categoryId: z.number().int().positive(),
    subcategoryId: z.number().int().positive().optional(),
    publisherId: z.number().int().positive().optional(),
    title: z.string().min(1).max(255),
    isbn: z.string().min(10).max(13),
    description: z.string().max(1000).optional(),
    datePublished: z.date().optional(),
    frontCoverUrl: z.string().url().optional(),
    mimeType: z.string().optional(),
    fileSize: z.number().int().positive().optional(),
});

export const CreateBookSchema = BookSchema.omit({ id: true });
export const UpdateBookSchema = CreateBookSchema.partial();