import z from 'zod';
import {IncidentType} from "../../../../../generated/prisma/enums.js";

// Esquema de validación para los incidentes
const incidentSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    physicalCopyId: z.number().int().positive().optional(),
    loanId: z.number().int().positive().optional(),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    typeIncident: z.string(),
    messageAdmin: z.string().min(1).max(500).optional(),
    status: z.enum(IncidentType),
})

export const createIncidentSchema = incidentSchema.omit({ id: true, status: true, messageAdmin: true });
export const updateIncidentSchema = incidentSchema.partial().omit({ id: true, userId: true, physicalCopyId: true, loanId: true });