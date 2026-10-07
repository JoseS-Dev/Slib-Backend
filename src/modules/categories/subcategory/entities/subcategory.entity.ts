export class Subcategory {
    id!: number;
    categoryId!: number
    name!: string;
    description?: string | null
    isActive!: boolean;
    createdAt!: Date
    updatedAt!: Date
    deletedAt?: Date | null
}
