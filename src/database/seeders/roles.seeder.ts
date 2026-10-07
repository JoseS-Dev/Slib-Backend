import type { Role } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface RoleSeed {
  name: string;
  isDefault: boolean;
}

const ROLE_CATALOG: ReadonlyArray<RoleSeed> = [
  { name: 'Administrador', isDefault: false },
  { name: 'Recepcionista', isDefault: false },
  { name: 'Bibliotecario', isDefault: false },
  { name: 'Usuario',       isDefault: true  },
];

export class RolesSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<Role[]> {
    const created: Role[] = [];

    for (const roleSeed of ROLE_CATALOG) {
      const existing = await this.prisma.role.findUnique({
        where: { name: roleSeed.name },
      });
      if (existing) {
        created.push(existing);
        continue;
      }
      const role = await this.prisma.role.create({
        data: {
          name: roleSeed.name,
          isDefault: roleSeed.isDefault,
        },
      });
      created.push(role);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.role.deleteMany({
      where: { name: { in: ROLE_CATALOG.map((r) => r.name) } },
    });
    return deleted.count;
  }
}