import { Book } from "../../book/entities/book.entity.js";
import { Author } from "../../authors/entities/author.entity.js";

export class BookAuthor {
    bookId!: number;
    authorId!: number;
    book?: Book;
    author?: Author;
}
