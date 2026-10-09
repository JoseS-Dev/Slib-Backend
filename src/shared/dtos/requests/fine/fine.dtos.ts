import z from 'zod';
import { FineStatus } from '../../../../../generated/prisma/enums.js';

// Defino el esquema de validación de las multas
const fineSchema = z.object({
    id: z.number().int().positive(),
    loanId: z.number().int().positive(),
    userId: z.number().int().positive(),
    amount: z.number().positive(),
    reason: z.string().min(1).max(255).optional(),
    status: z.enum(FineStatus),
});

export const createFineSchema = fineSchema.omit({ id: true, status: true});
export const updateFineSchema = fineSchema.partial().omit({ id: true, loanId: true, userId: true });