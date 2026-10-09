import { FineStatus } from '../../../../../generated/prisma/enums.js';
import { Decimal } from '../../../../../generated/prisma/internal/prismaNamespace.js';

export class Fine {
    id!: number;
    loanId!: number;
    userId!: number;
    amount!: Decimal;
    reason?: string | null;
    status!: FineStatus;
    createdAt!: Date;
    updatedAt!: Date;
}
