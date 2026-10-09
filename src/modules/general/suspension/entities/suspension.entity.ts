import { SuspensionStatus } from '../../../../../generated/prisma/enums.js';

export class Suspension {
    id!: number;
    userId!: number;
    fineId?: number | null
    reason!: string;
    startDate!: Date;
    endDate?: Date | null;
    status!: SuspensionStatus;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
