export class Permission {
  id!: number;
  name!: string;
  description?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
