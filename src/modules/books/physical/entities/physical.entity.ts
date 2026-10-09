import { PhysicalCopyStatus } from '../../../../../generated/prisma/enums.js';

export class Physical {
  id!: number;
  bookId!: number;
  copyNumber!: string;
  ubication?: string | null;
  status!: PhysicalCopyStatus;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
