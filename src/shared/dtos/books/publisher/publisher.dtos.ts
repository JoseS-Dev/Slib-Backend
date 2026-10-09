import z from 'zod';

// Defino el esquema de validación de la editorial
const publisherSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

export const createPublisherSchema = publisherSchema.omit({ id: true });
export const updatePublisherSchema = createPublisherSchema.partial();
