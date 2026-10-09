import { NotificationType } from '../../../../../generated/prisma/enums.js';

export class Notification {
    id!: number;
    userId!: number
    title!: string;
    message!: string;
    typeNotification!: NotificationType;
    isRead!: boolean;
    createdAt!: Date;
    updatedAt!: Date
}
