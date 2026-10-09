import z from 'zod';
import { SuspensionStatus } from '../../../../../generated/prisma/enums.js';

// Defino el esquema de validación de las suspensiones
const suspensionSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    fineId: z.number().int().positive().optional(),
    reason: z.string().min(1).max(255),
    startDate: z.string().refine((value) => {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }).transform((value) => new Date(value)),
    endDate: z.string().refine((value) => {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }).transform((value) => new Date(value)).optional(),
    status: z.enum(SuspensionStatus),
});

export const createSuspensionSchema = suspensionSchema.omit({ id: true, status: true });
export const updateSuspensionSchema = suspensionSchema.partial().omit({ id: true, userId: true, fineId: true });