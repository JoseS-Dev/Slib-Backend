import type { Author, Book } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

export class BookAuthorSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(
    books: Book[],
    authors: Author[],
    authorIndexesByIsbn: Map<string, number[]>,
  ): Promise<number> {
    const authorByFirstName = new Map(
      authors.map((a) => [a.firstName, a] as const),
    );
    let created = 0;

    for (const book of books) {
      const indexes = authorIndexesByIsbn.get(book.isbn) ?? [];
      for (const idx of indexes) {
        const authorAtIdx = authors[idx];
        if (!authorAtIdx) continue;

        // El catálogo de libros referencia autores por índice, pero el de
        // autores se identifica por firstName. Buscamos coincidencia exacta.
        const author = authorByFirstName.get(authorAtIdx.firstName);
        if (!author) continue;

        const existing = await this.prisma.bookAuthor.findUnique({
          where: { bookId_authorId: { bookId: book.id, authorId: author.id } },
        });
        if (existing) continue;

        await this.prisma.bookAuthor.create({
          data: { bookId: book.id, authorId: author.id },
        });
        created += 1;
      }
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.bookAuthor.deleteMany({});
    return deleted.count;
  }
}
