export class Category {
    id!: number;
    name!: string;
    isActive!: boolean;
    description?: string | null;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
