import z from 'zod';
import { RequestStatus } from '../../../../../generated/prisma/enums.js';

// Defino el esquema de validación para las solicitudes de libros
const requestSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    bookId: z.number().int().positive(),
    requestDate: z.string().refine((value) => {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }).transform((value) => new Date(value)).optional(),
    reasonCancellation: z.string().max(500).optional(),
    status: z.enum(RequestStatus),
});

export const createRequestSchema = requestSchema.omit({ id: true, requestDate: true, reasonCancellation: true, status: true });
export const updateRequestSchema = requestSchema.partial().omit({ id: true, userId: true });