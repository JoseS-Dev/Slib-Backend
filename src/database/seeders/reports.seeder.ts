import { fakerES as faker } from '@faker-js/faker';
import type { Report } from '../../../generated/prisma/client.js';
import { ReportType } from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface ReportTemplate {
  type: ReportType;
  name: string;
  description: string;
}

// Plantillas alineadas con el enum `ReportType` del schema.
const TEMPLATES: ReadonlyArray<ReportTemplate> = [
  {
    type: ReportType.PRESTAMOS_ACTIVOS,
    name: 'Préstamos activos',
    description: 'Listado de libros actualmente en poder de los usuarios.',
  },
  {
    type: ReportType.PRESTAMOS_VENCIDOS,
    name: 'Préstamos vencidos',
    description: 'Usuarios morosos con fecha límite excedida.',
  },
  {
    type: ReportType.HISTORIAL_PRESTAMOS,
    name: 'Historial de préstamos',
    description: 'Histórico general de préstamos en un rango de fechas.',
  },
  {
    type: ReportType.INVENTARIO_GENERAL,
    name: 'Inventario general',
    description: 'Estado actual de todos los libros y ejemplares físicos.',
  },
  {
    type: ReportType.LIBROS_MAS_SOLICITADOS,
    name: 'Libros más solicitados',
    description: 'Ranking de los libros con mayor demanda.',
  },
  {
    type: ReportType.EJEMPLARES_BAJA,
    name: 'Ejemplares de baja',
    description: 'Libros perdidos, dañados o dados de baja definitiva.',
  },
  {
    type: ReportType.MULTAS_PENDIENTES,
    name: 'Multas pendientes',
    description: 'Dinero total acumulado en multas por cobrar.',
  },
  {
    type: ReportType.MULTAS_RECAUDADAS,
    name: 'Multas recaudadas',
    description: 'Ingresos generados por multas pagadas en un período.',
  },
  {
    type: ReportType.USUARIOS_ACTIVOS,
    name: 'Usuarios activos',
    description: 'Estadísticas de usuarios con mayor actividad.',
  },
];

export class ReportsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea reportes de administración. Sólo los usuarios con rol `Administrador`
   * o `Recepcionista` pueden poseer reportes, tal como lo valida el servicio.
   * Es idempotente por (userId, name).
   */
  async run(): Promise<Report[]> {
    const created: Report[] = [];

    const staff = await this.prisma.extended.user.findMany({
      where: { role: { name: { in: ['Administrador', 'Recepcionista'] } } },
    });
    if (staff.length === 0) return created;

    for (const user of staff) {
      const count = faker.number.int({ min: 1, max: 3 });
      const picked = faker.helpers.arrayElements(
        TEMPLATES,
        Math.min(count, TEMPLATES.length),
      );

      for (const template of picked) {
        const existing = await this.prisma.extended.report.findFirst({
          where: { userId: user.id, name: template.name },
        });
        if (existing) {
          created.push(existing);
          continue;
        }

        const report = await this.prisma.report.create({
          data: {
            userId: user.id,
            name: template.name,
            description: template.description,
            typeReport: template.type,
            isActive: faker.datatype.boolean({ probability: 0.85 }),
          },
        });
        created.push(report);
      }
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.report.deleteMany({});
    return deleted.count;
  }
}
