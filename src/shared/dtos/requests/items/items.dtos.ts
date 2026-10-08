import z from 'zod';
import { RequestStatus } from '../../../../../generated/prisma/enums.js';

// Defino el esquema de validación de los items de las solicitudes de libros
const itemSchema = z.object({
    id: z.number().int().positive(),
    requestId: z.number().int().positive(),
    physicalCopyId: z.number().int().positive(),
    status: z.enum(RequestStatus),
});

export const createItemSchema = itemSchema.omit({ id: true, requestId: true, status: true });
export const updateItemSchema = itemSchema.partial().omit({ id: true, requestId: true, status: true });