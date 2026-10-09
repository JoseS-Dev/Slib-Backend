import z from 'zod';
import {ReportType} from "../../../../../generated/prisma/enums.js";

// Defino el esquema de validaciòn para los reportes
const reportSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500).optional(),
    typeReport: z.enum(ReportType),
    isActive: z.boolean(),
});

export const createReportSchema = reportSchema.omit({ id: true, isActive: true });
export const updateReportSchema = reportSchema.partial().omit({ id: true, userId: true });