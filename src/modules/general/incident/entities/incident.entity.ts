import { IncidentType } from '../../../../../generated/prisma/enums.js';

export class Incident {
    id!: number;
    userId!: number
    physicalCopyId?: number | null;
    loanId?: number | null;
    title!: string;
    description!: string;
    typeIncident!: string;
    messageAdmin?: string | null;
    status!: IncidentType
    createdAt!: Date;
    updatedAt!: Date
    deletedAt?: Date | null;
}
