import z from 'zod';

const authorSchema = z.object({
    id: z.number().int().positive(),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    biography: z.string().max(1000).optional(),
    bookIds: z.array(z.number().int().positive()).optional(),
});

export const createAuthorSchema = authorSchema.omit({ id: true });
export const updateAuthorSchema = createAuthorSchema.partial();
