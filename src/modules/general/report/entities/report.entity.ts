import { ReportType } from '../../../../../generated/prisma/enums.js';

export class Report {
    id!: number;
    userId!: number;
    name!: string;
    description?: string | null;
    typeReport!: ReportType;
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
