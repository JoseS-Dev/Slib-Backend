import { LoanStatus } from '../../../../../generated/prisma/enums.js';

export class Loan {
  id!: number;
  requestItemId!: number;
  physicalCopyId!: number;
  recepcionistId!: number;
  loanDate!: Date;
  returnDate?: Date | null;
  returnDateReal?: Date | null;
  status!: LoanStatus;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
