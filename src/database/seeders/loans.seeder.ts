import { fakerES as faker } from '@faker-js/faker';
import type { Loan, RequestItem, User } from '../../../generated/prisma/client.js';
import { LoanStatus } from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

export class LoansSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un préstamo por cada `RequestItem` con estado `Aprobado`. Aplica
   * reglas de transición de `RecordLoanStatus`:
   *   - 60% -> `Activo` (sin returnDateReal, returnDate futura)
   *   - 25% -> `Finalizado` (returnDateReal en el pasado)
   *   - 15% -> `Vencido`   (returnDate en el pasado, sin returnDateReal)
   * El recepcionista se resuelve por email con rol `Recepcionista`.
   */
  async run(
    items: RequestItem[],
    users: User[],
  ): Promise<Loan[]> {
    const created: Loan[] = [];

    const recepcionista = users.find((u) => u.email === 'recepcion@slib.com');
    if (!recepcionista) {
      return created;
    }

    // Filtramos solo items aprobados y que aún no tengan un loan asociado.
    const approvedItems = items.filter((it) => it.status === 'Aprobado');
    for (const item of approvedItems) {
      const existing = await this.prisma.loan.findFirst({
        where: { requestItemId: item.id },
      });
      if (existing) {
        created.push(existing);
        continue;
      }

      const seed = pickSeedFor();
      const loanDate = new Date(Date.now() - seed.loanDaysAgo * 24 * 60 * 60 * 1000);
      const returnDate = new Date(loanDate.getTime() + seed.durationDays * 24 * 60 * 60 * 1000);
      const returnDateReal =
        seed.status === LoanStatus.Finalizado
          ? faker.date.between({
              from: loanDate,
              to: new Date(Math.min(returnDate.getTime(), Date.now() - 24 * 60 * 60 * 1000)),
            })
          : null;

      const loan = await this.prisma.loan.create({
        data: {
          requestItemId: item.id,
          physicalCopyId: item.physicalCopyId,
          recepcionistId: recepcionista.id,
          loanDate,
          returnDate,
          returnDateReal,
          status: seed.status,
        },
      });
      created.push(loan);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.loan.deleteMany({});
    return deleted.count;
  }
}

function pickSeedFor(): { loanDaysAgo: number; durationDays: number; status: LoanStatus } {
  const r = faker.number.float();
  if (r < 0.6) {
    return {
      loanDaysAgo: faker.number.int({ min: 1, max: 5 }),
      durationDays: faker.number.int({ min: 7, max: 21 }),
      status: LoanStatus.Activo,
    };
  }
  if (r < 0.85) {
    return {
      loanDaysAgo: faker.number.int({ min: 10, max: 40 }),
      durationDays: faker.number.int({ min: 7, max: 21 }),
      status: LoanStatus.Finalizado,
    };
  }
  return {
    loanDaysAgo: faker.number.int({ min: 25, max: 60 }),
    durationDays: faker.number.int({ min: 5, max: 10 }),
    status: LoanStatus.Vencido,
  };
}
