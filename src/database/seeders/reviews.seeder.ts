import { fakerES as faker } from '@faker-js/faker';
import type { Book, Review, User } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const COMMENTS: ReadonlyArray<string> = [
  'Una obra que se queda contigo mucho después de cerrarla.',
  'Personajes memorables y una prosa muy cuidada.',
  'El ritmo decae en la mitad, pero el final compensa.',
  'Recomendado para quienes disfrutan de este género.',
  'No es para todos los públicos, pero a mí me encantó.',
  'Una lectura ligera y entretenida para el verano.',
  'La traducción deja un poco que desear, por lo demás excelente.',
  'Referente obligado del género, sin duda alguna.',
];

export class ReviewsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea reseñas (Usuario → Libro) con calificación 1-5 y comentario opcional.
   * Es idempotente por la pareja (userId, bookId), ya que el modelo impide
   * reseñas duplicadas de un mismo usuario sobre un mismo libro.
   */
  async run(users: User[], books: Book[]): Promise<Review[]> {
    const created: Review[] = [];
    if (users.length === 0 || books.length === 0) return created;

    for (const user of users) {
      const count = faker.number.int({ min: 0, max: 3 });
      if (count === 0) continue;

      const picked = faker.helpers.arrayElements(
        books,
        Math.min(count, books.length),
      );

      for (const book of picked) {
        const existing = await this.prisma.review.findFirst({
          where: { userId: user.id, bookId: book.id },
        });
        if (existing) {
          created.push(existing);
          continue;
        }

        const review = await this.prisma.review.create({
          data: {
            userId: user.id,
            bookId: book.id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.datatype.boolean({ probability: 0.75 })
              ? faker.helpers.arrayElement(COMMENTS)
              : null,
            isActive: faker.datatype.boolean({ probability: 0.9 }),
          },
        });
        created.push(review);
      }
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.review.deleteMany({});
    return deleted.count;
  }
}
