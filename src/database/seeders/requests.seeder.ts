import { fakerES as faker } from '@faker-js/faker';
import type { PhysicalCopy, Request, RequestItem, User } from '../../../generated/prisma/client.js';
import { RequestStatus } from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface RequestSeed {
  userEmail: string;
  copyNumbers: string[];
  title: string;
  description?: string;
  status: RequestStatus;
  reasonCancellation?: string;
  daysAgo: number;
}

interface RequestItemSeed {
  requestIdx: number;
  copyNumber: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

// Catálogo curado de solicitudes: cada usuario conocido tiene entre 1 y 2
// solicitudes; los usuarios faker se completan con `fillRandom` para
// mantener un volumen cercano a ~30 solicitudes en total.
const KNOWN_REQUEST_CATALOG: ReadonlyArray<RequestSeed> = [
  {
    userEmail: 'admin@slib.com',
    copyNumbers: ['9780307474728-01', '9780307474728-02'],
    title: 'Solicitud para colección personal de realismo mágico',
    description: 'Necesito ambas copias para una exposición interna.',
    status: RequestStatus.Aprobada,
    daysAgo: 14,
  },
  {
    userEmail: 'recepcion@slib.com',
    copyNumbers: ['9781501142970-01'],
    title: 'Reserva de ejemplar de terror para club de lectura',
    description: 'Para la sesión de este viernes.',
    status: RequestStatus.Aprobada,
    daysAgo: 7,
  },
  {
    userEmail: 'usuario@slib.com',
    copyNumbers: ['9788499924211-01'],
    title: 'Solicitud de Sapiens para trabajo universitario',
    status: RequestStatus.Pendiente,
    daysAgo: 2,
  },
];

// Plantilla para llenar usuarios faker con solicitudes aleatorias.
const RANDOM_TITLES: ReadonlyArray<string> = [
  'Solicitud para investigación personal',
  'Reserva para club de lectura',
  'Necesario para proyecto académico',
  'Solicitud de préstamo recomendada',
  'Reserva para tesis de maestría',
  'Estudio comparativo de obras',
  'Material para curso de verano',
  'Préstamo para presentación interna',
];

export class RequestsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera solicitudes (Request + RequestItem) para los 3 usuarios conocidos
   * más un subconjunto aleatorio de usuarios faker, asignando copias físicas
   * reales del catálogo sembrado. Es idempotente: si ya existe una solicitud
   * con el mismo título+userId dentro de los últimos 30 días, la omite.
   */
  async run(
    users: User[],
    physicalCopies: PhysicalCopy[],
  ): Promise<{ requests: Request[]; items: RequestItem[] }> {
    const createdRequests: Request[] = [];
    const createdItems: RequestItem[] = [];

    const allCopies = physicalCopies;
    if (allCopies.length === 0) {
      return { requests: createdRequests, items: createdItems };
    }

    const userByEmail = new Map(users.map((u) => [u.email, u] as const));
    const copyByNumber = new Map(allCopies.map((c) => [c.copyNumber, c] as const));

    // 1) Solicitudes de los 3 usuarios conocidos
    const itemPlans: Array<{ requestIdx: number; status: 'Pendiente' | 'Aprobado' | 'Rechazado' }> = [];

    for (const seed of KNOWN_REQUEST_CATALOG) {
      const user = userByEmail.get(seed.userEmail);
      if (!user) continue;

      // Idempotencia: si ya existe una solicitud con el mismo título y userId,
      // la omitimos (sufijo de frescura: últimos 60 días).
      const existing = await this.prisma.request.findFirst({
        where: {
          userId: user.id,
          titleRequest: seed.title,
          requestDate: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        },
      });
      if (existing) {
        createdRequests.push(existing);
        continue;
      }

      const reqItemsToCreate = seed.copyNumbers
        .map((cn) => copyByNumber.get(cn))
        .filter((c): c is PhysicalCopy => Boolean(c));
      if (reqItemsToCreate.length === 0) continue;

      const requestDate = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000);
      const reasonCancellation =
        seed.status === RequestStatus.Cancelada ? seed.reasonCancellation ?? 'Cancelada por duplicidad.' : null;

      const request = await this.prisma.request.create({
        data: {
          userId: user.id,
          titleRequest: seed.title,
          descriptionRequest: seed.description ?? null,
          requestDate,
          reasonCancellation,
          status: seed.status,
          items: {
            create: reqItemsToCreate.map((c) => ({
              physicalCopyId: c.id,
              status: deriveItemStatusFromRequest(seed.status),
            })),
          },
        },
        include: { items: true },
      });

      createdRequests.push(request);
      createdItems.push(...request.items);
    }

    // 2) Solicitudes aleatorias para usuarios faker
    const nonKnownUsers = users.filter(
      (u) => !['admin@slib.com', 'usuario@slib.com', 'recepcion@slib.com'].includes(u.email),
    );

    // Mezclamos las copias para no siempre pedir las mismas.
    const shuffledCopies = [...allCopies].sort(() => faker.number.float() - 0.5);

    for (let i = 0; i < nonKnownUsers.length; i += 1) {
      const user = nonKnownUsers[i];
      if (!user) continue;

      // 60% de probabilidad de tener 1 solicitud, 25% de tener 2.
      const roll = faker.number.float();
      let count = 0;
      if (roll < 0.6) count = 1;
      else if (roll < 0.85) count = 2;
      if (count === 0) continue;

      for (let n = 0; n < count; n += 1) {
        const title = `${faker.helpers.arrayElement(RANDOM_TITLES)} #${i + 1}-${n + 1}`;
        // Status ponderado
        const s = faker.number.float();
        let status: RequestStatus;
        if (s < 0.55) status = RequestStatus.Aprobada;
        else if (s < 0.78) status = RequestStatus.Pendiente;
        else if (s < 0.9) status = RequestStatus.Rechazada;
        else status = RequestStatus.Cancelada;

        const daysAgo = faker.number.int({ min: 1, max: 30 });
        const requestDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        // 1 o 2 copias por solicitud
        const itemCount = faker.number.int({ min: 1, max: 2 });
        const pickedCopies: PhysicalCopy[] = [];
        for (let k = 0; k < itemCount; k += 1) {
          const candidate = shuffledCopies[(i * 7 + n * 3 + k) % shuffledCopies.length];
          if (candidate && !pickedCopies.find((p) => p.id === candidate.id)) {
            pickedCopies.push(candidate);
          }
        }
        if (pickedCopies.length === 0) continue;

        const existing = await this.prisma.request.findFirst({
          where: {
            userId: user.id,
            titleRequest: title,
          },
        });
        if (existing) {
          createdRequests.push(existing);
          continue;
        }

        const reasonCancellation =
          status === RequestStatus.Cancelada
            ? faker.helpers.arrayElement([
                'Cancelada por falta de stock.',
                'Cancelada por cambio de fecha del evento.',
                'Usuario desistió de la solicitud.',
              ])
            : null;

        const request = await this.prisma.request.create({
          data: {
            userId: user.id,
            titleRequest: title,
            descriptionRequest: faker.lorem.sentence({ min: 8, max: 20 }),
            requestDate,
            reasonCancellation,
            status,
            items: {
              create: pickedCopies.map((c) => ({
                physicalCopyId: c.id,
                status: deriveItemStatusFromRequest(status),
              })),
            },
          },
          include: { items: true },
        });

        createdRequests.push(request);
        createdItems.push(...request.items);
      }
    }

    return { requests: createdRequests, items: createdItems };
  }

  async clear(): Promise<{ requests: number; items: number }> {
    // Eliminamos primero los items, luego las solicitudes.
    const deletedItems = await this.prisma.requestItem.deleteMany({});
    const deletedRequests = await this.prisma.request.deleteMany({});
    return { requests: deletedRequests.count, items: deletedItems.count };
  }
}

function deriveItemStatusFromRequest(
  status: RequestStatus,
): 'Pendiente' | 'Aprobado' | 'Rechazado' {
  if (status === RequestStatus.Aprobada) return 'Aprobado';
  if (status === RequestStatus.Rechazada) return 'Rechazado';
  if (status === RequestStatus.Cancelada) return 'Rechazado';
  return 'Pendiente';
}
