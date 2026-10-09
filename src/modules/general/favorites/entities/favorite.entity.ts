import { User } from '../../../auth/users/entities/user.entity.js';
import { Book } from '../../../books/book/entities/book.entity.js';

export class Favorite {
    id!: number;
    userId!: number
    bookId!: number;
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date
    user?: User;
    book?: Book;
}
