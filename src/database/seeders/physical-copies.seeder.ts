import type { Book, PhysicalCopy } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface PhysicalCopySeed {
  isbn: string;
  copyNumber: string;
  ubication: string;
}

// Genera 2 copias por libro del catálogo (Disponible / Disponible en ubicaciones distintas)
function buildCatalog(
  books: Book[],
): Array<PhysicalCopySeed & { bookId: number }> {
  const out: Array<PhysicalCopySeed & { bookId: number }> = [];
  for (const book of books) {
    for (let n = 1; n <= 2; n += 1) {
      out.push({
        bookId: book.id,
        isbn: book.isbn,
        copyNumber: `${book.isbn}-${n.toString().padStart(2, '0')}`,
        ubication: `Estante ${String.fromCharCode(65 + (n - 1))} · Pasillo ${(book.id % 6) + 1}`,
      });
    }
  }
  return out;
}

export class PhysicalCopiesSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(books: Book[]): Promise<PhysicalCopy[]> {
    const catalog = buildCatalog(books);
    const created: PhysicalCopy[] = [];

    for (const seed of catalog) {
      const existing = await this.prisma.physicalCopy.findUnique({
        where: { copyNumber: seed.copyNumber },
      });
      if (existing) {
        created.push(existing);
        continue;
      }
      const copy = await this.prisma.physicalCopy.create({
        data: {
          bookId: seed.bookId,
          copyNumber: seed.copyNumber,
          ubication: seed.ubication,
        },
      });
      created.push(copy);
    }

    return created;
  }

  async clear(): Promise<number> {
    // Limpiamos por patrón: cualquier copyNumber que coincida con un ISBN del catálogo + sufijo -NN
    const books = await this.prisma.book.findMany({
      select: { isbn: true },
    });
    const prefixes = books.map((b) => b.isbn);
    const copies = await this.prisma.physicalCopy.findMany({
      where: {
        copyNumber: { startsWith: '' },
      },
      select: { copyNumber: true, id: true },
    });
    const toDelete = copies
      .filter((c) => prefixes.some((p) => c.copyNumber.startsWith(p)))
      .map((c) => c.id);
    if (toDelete.length === 0) return 0;
    const deleted = await this.prisma.physicalCopy.deleteMany({
      where: { id: { in: toDelete } },
    });
    return deleted.count;
  }
}
