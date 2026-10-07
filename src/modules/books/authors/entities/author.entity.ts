export class Author {
    id!: number;
    firstName!: string
    lastName!: string;
    biography?: string | null;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date | null;
}
