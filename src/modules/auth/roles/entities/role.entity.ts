export class Role {
    id!: number;
    name!: string;
    isDefault?: boolean | null;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
