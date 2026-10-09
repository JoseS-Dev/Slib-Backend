import type {
  Role,
  Permission,
  RolePermission,
} from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface RolePermissionMatrix {
  [roleName: string]: ReadonlyArray<string>;
}

const ROLE_PERMISSIONS_MATRIX: RolePermissionMatrix = {
  Administrador: [
    'CREATE_USER',
    'READ_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'CHANGE_USER_STATUS',
    'CREATE_ROLE',
    'READ_ROLE',
    'UPDATE_ROLE',
    'DELETE_ROLE',
    'CREATE_PERMISSION',
    'READ_PERMISSION',
    'UPDATE_PERMISSION',
    'DELETE_PERMISSION',
    'ASSIGN_ROLE_PERMISSION',
    'CREATE_BOOK',
    'READ_BOOK',
    'UPDATE_BOOK',
    'DELETE_BOOK',
    'CREATE_CATEGORY',
    'READ_CATEGORY',
    'UPDATE_CATEGORY',
    'DELETE_CATEGORY',
    'CREATE_AUTHOR',
    'READ_AUTHOR',
    'UPDATE_AUTHOR',
    'DELETE_AUTHOR',
    'CREATE_PUBLISHER',
    'READ_PUBLISHER',
    'UPDATE_PUBLISHER',
    'DELETE_PUBLISHER',
    'CREATE_PHYSICAL_COPY',
    'READ_PHYSICAL_COPY',
    'UPDATE_PHYSICAL_COPY',
    'DELETE_PHYSICAL_COPY',
    'CREATE_LOAN',
    'READ_LOAN',
    'UPDATE_LOAN',
    'DELETE_LOAN',
    'CREATE_REQUEST',
    'READ_REQUEST',
    'APPROVE_REQUEST',
    'CANCEL_REQUEST',
    'CREATE_FINE',
    'READ_FINE',
    'PAY_FINE',
    'FORGIVE_FINE',
    'CREATE_SUSPENSION',
    'READ_SUSPENSION',
    'REVOKE_SUSPENSION',
    'CREATE_INCIDENT',
    'READ_INCIDENT',
    'UPDATE_INCIDENT',
    'READ_REPORT',
    'CREATE_REPORT',
    'READ_NOTIFICATION',
  ],
  Recepcionista: [
    'READ_USER',
    'READ_ROLE',
    'READ_PERMISSION',
    'READ_BOOK',
    'UPDATE_BOOK',
    'READ_CATEGORY',
    'READ_AUTHOR',
    'READ_PUBLISHER',
    'CREATE_PHYSICAL_COPY',
    'READ_PHYSICAL_COPY',
    'UPDATE_PHYSICAL_COPY',
    'CREATE_LOAN',
    'READ_LOAN',
    'UPDATE_LOAN',
    'READ_REQUEST',
    'APPROVE_REQUEST',
    'CANCEL_REQUEST',
    'CREATE_FINE',
    'READ_FINE',
    'PAY_FINE',
    'READ_SUSPENSION',
    'CREATE_INCIDENT',
    'READ_INCIDENT',
    'UPDATE_INCIDENT',
    'READ_NOTIFICATION',
  ],
  Bibliotecario: [
    'READ_USER',
    'READ_ROLE',
    'READ_PERMISSION',
    'CREATE_BOOK',
    'READ_BOOK',
    'UPDATE_BOOK',
    'CREATE_CATEGORY',
    'READ_CATEGORY',
    'UPDATE_CATEGORY',
    'CREATE_AUTHOR',
    'READ_AUTHOR',
    'UPDATE_AUTHOR',
    'CREATE_PUBLISHER',
    'READ_PUBLISHER',
    'UPDATE_PUBLISHER',
    'READ_PHYSICAL_COPY',
    'READ_REQUEST',
    'CREATE_INCIDENT',
    'READ_INCIDENT',
    'READ_NOTIFICATION',
  ],
  Usuario: [
    'READ_BOOK',
    'READ_CATEGORY',
    'READ_AUTHOR',
    'READ_PUBLISHER',
    'CREATE_REQUEST',
    'READ_REQUEST',
    'CANCEL_REQUEST',
    'READ_NOTIFICATION',
    'CREATE_INCIDENT',
  ],
};

export class RolePermissionSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(roles: Role[], permissions: Permission[]): Promise<number> {
    const permissionByName = new Map(permissions.map((p) => [p.name, p]));
    let totalCreated = 0;

    for (const role of roles) {
      const permissionNames = ROLE_PERMISSIONS_MATRIX[role.name] ?? [];
      for (const permissionName of permissionNames) {
        const permission = permissionByName.get(permissionName);
        if (!permission) continue;

        const exists = await this.prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
        });
        if (exists) continue;

        await this.prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        totalCreated++;
      }
    }

    return totalCreated;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.rolePermission.deleteMany({});
    return deleted.count;
  }
}
