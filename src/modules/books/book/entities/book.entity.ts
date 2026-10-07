export class Book {
    id!: number;
    categoryId!: number;
    subcategoryId?: number | null;
    publisherId?: number | null;
    title!: string;
    isbn!: string;
    description?: string | null;
    datePublished?: Date | null;
    frontCoverUrl?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
