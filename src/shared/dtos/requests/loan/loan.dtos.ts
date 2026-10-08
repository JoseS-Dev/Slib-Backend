import z from 'zod';
import { LoanStatus } from '../../../../../generated/prisma/enums.js';

// Defino el esquema de validación para los préstamos
const loanSchema = z.object({
    id: z.number().int().positive(),
    requestItemId: z.number().int().positive(),
    physicalCopyId: z.number().int().positive(),
    recepcionistId: z.number().int().positive(),
    loanDate: z.string().refine((value) => {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }).transform((value) => new Date(value)),
    returnDate: z.string().refine((value) => {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }).transform((value) => new Date(value)).optional(),
    returnDateReal: z.string().refine((value) => {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }).transform((value) => new Date(value)).optional(),
    status: z.enum(LoanStatus),
});

export const createLoanSchema = loanSchema.omit({ id: true, status: true, loanDate: true });
export const updateLoanSchema = loanSchema.partial().omit({ id: true, requestItemId: true, physicalCopyId: true, recepcionistId: true });