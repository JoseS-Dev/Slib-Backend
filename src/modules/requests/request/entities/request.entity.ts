import { RequestStatus } from '../../../../../generated/prisma/enums.js';
import { User } from '../../../auth/users/entities/user.entity.js';
export class Request {
  id!: number;
  userId!: number;
  titleRequest!: string;
  descriptionRequest?: string | null;
  requestDate!: Date;
  reasonCancellation?: string | null;
  status!: RequestStatus;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
  user?: User;
}
