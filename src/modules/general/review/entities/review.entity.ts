export class Review {
    id!: number;
    userId!: number;
    bookId!: number;
    rating!: number;
    comment?: string | null;
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date
}
