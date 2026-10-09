import { fakerES as faker } from '@faker-js/faker';
import type { Fine, Loan } from '../../../generated/prisma/client.js';
import { FineStatus, LoanStatus } from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const REASONS: ReadonlyArray<string> = [
  'Devolución tardía del ejemplar.',
  'Daño leve en la cubierta.',
  'Retraso superior a una semana.',
  'Pérdida temporal del ejemplar.',
];

export class FinesSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea multas asociadas a préstamos vencidos. Si no existiese ningún préstamo
   * en estado `Vencido`, se promueven hasta 3 préstamos para poder sembrar
   * multas de forma determinista. Es idempotente por `loanId`.
   */
  async run(loans: Loan[]): Promise<Fine[]> {
    const created: Fine[] = [];
    if (loans.length === 0) return created;

    // Resolver el usuario propietario de cada préstamo a través de su item/solicitud.
    const items = await this.prisma.requestItem.findMany({
      include: { request: { select: { userId: true } } },
    });
    const userIdByItemId = new Map(
      items.map((item) => [item.id, item.request.userId] as const),
    );

    const penaltyLoans = loans.filter(
      (loan) => loan.status === LoanStatus.Vencido,
    );

    if (penaltyLoans.length === 0) {
      const toPromote = loans.slice(0, Math.min(3, loans.length));
      for (const loan of toPromote) {
        const updated = await this.prisma.loan.update({
          where: { id: loan.id },
          data: {
            status: LoanStatus.Vencido,
            returnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        });
        penaltyLoans.push(updated);
      }
    }

    for (const loan of penaltyLoans) {
      const existing = await this.prisma.fine.findFirst({
        where: { loanId: loan.id },
      });
      if (existing) {
        created.push(existing);
        continue;
      }

      const userId = userIdByItemId.get(loan.requestItemId);
      if (!userId) continue;

      const statusRoll = faker.number.float();
      const status =
        statusRoll < 0.6
          ? FineStatus.Pendiente
          : statusRoll < 0.9
            ? FineStatus.Pagada
            : FineStatus.Condonada;

      const fine = await this.prisma.fine.create({
        data: {
          loanId: loan.id,
          userId,
          amount: faker.number.float({ min: 3, max: 60, fractionDigits: 2 }),
          reason: faker.helpers.arrayElement(REASONS),
          status,
        },
      });
      created.push(fine);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.fine.deleteMany({});
    return deleted.count;
  }
}
