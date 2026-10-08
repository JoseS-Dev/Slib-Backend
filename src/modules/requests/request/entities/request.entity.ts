import { RequestStatus } from '../../../../../generated/prisma/enums.js';

export class Request {
    id!: number;
    userId!: number;
    bookId!: number;
    requestDate!: Date;
    reasonCancellation?: string| null;
    status!: RequestStatus;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
