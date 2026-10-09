import { BookSchema } from '../book/book.dtos.js';
import { authorSchema } from '../authors/authors.dtos.js';
import z from 'zod';

// Defino el esquema de validación de la tabla pivote entre un libro y un author
const bookAuthorSchema = z.object({
  bookId: BookSchema.shape.id,
  authorId: authorSchema.shape.id,
});

export const createBookAuthorSchema = bookAuthorSchema;
export const updateBookAuthorSchema = bookAuthorSchema.partial();
