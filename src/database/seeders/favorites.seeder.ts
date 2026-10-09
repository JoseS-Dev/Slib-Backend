import { fakerES as faker } from '@faker-js/faker';
import type { Book, Favorite, User } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

export class FavoritesSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea favoritos (Usuario ↔ Libro) eligiendo entre 0 y 4 libros por usuario.
   * Es idempotente por la pareja (userId, bookId). El modelo `Favorite` no es
   * soft-deletable, por lo que se usa el cliente base de Prisma.
   */
  async run(users: User[], books: Book[]): Promise<Favorite[]> {
    const created: Favorite[] = [];
    if (users.length === 0 || books.length === 0) return created;

    for (const user of users) {
      const count = faker.number.int({ min: 0, max: 4 });
      if (count === 0) continue;

      const picked = faker.helpers.arrayElements(
        books,
        Math.min(count, books.length),
      );

      for (const book of picked) {
        const existing = await this.prisma.favorite.findFirst({
          where: { userId: user.id, bookId: book.id },
        });
        if (existing) {
          created.push(existing);
          continue;
        }

        const favorite = await this.prisma.favorite.create({
          data: {
            userId: user.id,
            bookId: book.id,
            isActive: faker.datatype.boolean({ probability: 0.85 }),
          },
        });
        created.push(favorite);
      }
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.favorite.deleteMany({});
    return deleted.count;
  }
}
