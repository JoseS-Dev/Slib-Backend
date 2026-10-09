import { fakerES as faker } from '@faker-js/faker';
import type { Fine, Suspension } from '../../../generated/prisma/client.js';
import {
  FineStatus,
  SuspensionStatus,
} from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const REASONS: ReadonlyArray<string> = [
  'Acumulación de multas pendientes.',
  'Reincidencia en devoluciones tardías.',
  'Daño repetido de ejemplares.',
  'Incumplimiento reiterado del reglamento.',
];

export class SuspensionsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea suspensiones a partir de las multas pendientes. Es idempotente por
   * (userId, reason). El modelo `Suspension` es soft-deletable, por lo que las
   * lecturas de idempotencia usan el cliente extendido.
   */
  async run(fines: Fine[]): Promise<Suspension[]> {
    const created: Suspension[] = [];
    const pendingFines = fines.filter(
      (fine) => fine.status === FineStatus.Pendiente,
    );
    if (pendingFines.length === 0) return created;

    for (const fine of pendingFines) {
      if (!faker.datatype.boolean({ probability: 0.6 })) continue;

      const reason = faker.helpers.arrayElement(REASONS);
      const existing = await this.prisma.extended.suspension.findFirst({
        where: { userId: fine.userId, reason },
      });
      if (existing) {
        created.push(existing);
        continue;
      }

      const startDate = faker.date.recent({
        days: 30,
        refDate: fine.createdAt,
      });
      const statusRoll = faker.number.float();
      const status =
        statusRoll < 0.6
          ? SuspensionStatus.Activa
          : statusRoll < 0.85
            ? SuspensionStatus.Finalizada
            : SuspensionStatus.Revocada;
      const endDate =
        status === SuspensionStatus.Activa
          ? null
          : faker.date.soon({ days: 30, refDate: startDate });

      const suspension = await this.prisma.suspension.create({
        data: {
          userId: fine.userId,
          fineId: fine.id,
          reason,
          startDate,
          endDate,
          status,
        },
      });
      created.push(suspension);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.suspension.deleteMany({});
    return deleted.count;
  }
}
