import z from 'zod';
import { PhysicalCopyStatus } from '../../../../../generated/prisma/enums.js';

// Esquema de validación para las copias fisicas de los libros
const physicalCopySchema = z.object({
  id: z.number().int().positive(),
  bookId: z.number().int().positive(),
  copyNumber: z.string().min(1).max(50),
  ubication: z.string().min(1).max(100).optional(),
  status: z.enum(PhysicalCopyStatus),
});

export const createPhysicalCopySchema = physicalCopySchema.omit({
  id: true,
  status: true,
});
export const updatePhysicalCopySchema = physicalCopySchema
  .partial()
  .omit({ id: true, bookId: true });
