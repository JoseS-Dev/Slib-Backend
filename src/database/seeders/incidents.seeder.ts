import { fakerES as faker } from '@faker-js/faker';
import type {
  Incident,
  Loan,
  PhysicalCopy,
  User,
} from '../../../generated/prisma/client.js';
import { IncidentType } from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const INCIDENT_TYPES: ReadonlyArray<string> = [
  'Daño',
  'Retraso',
  'Pérdida',
  'Comportamiento',
  'Otro',
];

export class IncidentsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea incidencias reportadas por usuarios. Cada incidencia puede referenciar
   * un ejemplar físico y/o un préstamo. Es idempotente por (userId, title).
   *
   * Nota: el campo del schema es `pyhsicalCopyId` (typo histórico intencional).
   */
  async run(
    users: User[],
    physicalCopies: PhysicalCopy[],
    loans: Loan[],
  ): Promise<Incident[]> {
    const created: Incident[] = [];
    if (users.length === 0) return created;

    const total = faker.number.int({ min: 12, max: 20 });

    for (let i = 0; i < total; i += 1) {
      const user = faker.helpers.arrayElement(users);
      const linkedLoan =
        loans.length > 0 && faker.datatype.boolean({ probability: 0.5 })
          ? faker.helpers.arrayElement(loans)
          : null;
      const linkedCopy =
        physicalCopies.length > 0 &&
        faker.datatype.boolean({ probability: 0.6 })
          ? faker.helpers.arrayElement(physicalCopies)
          : null;

      const title = `Incidencia #${i + 1}: ${faker.helpers.arrayElement(INCIDENT_TYPES)}`;
      const existing = await this.prisma.extended.incident.findFirst({
        where: { userId: user.id, title },
      });
      if (existing) {
        created.push(existing);
        continue;
      }

      const statusRoll = faker.number.float();
      const status =
        statusRoll < 0.5
          ? IncidentType.Pendiente
          : statusRoll < 0.8
            ? IncidentType.En_Revision
            : IncidentType.Resuelta;

      const incident = await this.prisma.incident.create({
        data: {
          userId: user.id,
          pyhsicalCopyId: linkedCopy?.id ?? null,
          loanId: linkedLoan?.id ?? null,
          title,
          description: faker.lorem.sentence({ min: 10, max: 25 }),
          typeIncident: faker.helpers.arrayElement(INCIDENT_TYPES),
          messageAdmin:
            status === IncidentType.Pendiente
              ? null
              : 'Revisado por el equipo de administración.',
          status,
        },
      });
      created.push(incident);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.incident.deleteMany({});
    return deleted.count;
  }
}
