import z from 'zod';
import { NotificationType } from "../../../../../generated/prisma/enums.js";

// Defino el esquema de validación para las notificaciones
const notificationSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
    typeNotification: z.enum(NotificationType),
    isRead: z.boolean(),
});

export const createNotificationSchema = notificationSchema.omit({ id: true, isRead: true });
export const updateNotificationSchema = notificationSchema.partial().omit({ id: true, userId: true });