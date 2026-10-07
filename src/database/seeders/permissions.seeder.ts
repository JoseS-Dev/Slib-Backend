import { fakerES as faker } from '@faker-js/faker';
import type { Permission } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const PERMISSION_CATALOG: ReadonlyArray<{ name: string; description: string }> = [
  { name: 'CREATE_USER',    description: 'Permite crear nuevos usuarios en el sistema' },
  { name: 'READ_USER',      description: 'Permite consultar la información de los usuarios' },
  { name: 'UPDATE_USER',    description: 'Permite actualizar la información de los usuarios' },
  { name: 'DELETE_USER',    description: 'Permite eliminar (soft delete) usuarios del sistema' },
  { name: 'CHANGE_USER_STATUS', description: 'Permite activar o desactivar cuentas de usuario' },

  { name: 'CREATE_ROLE',    description: 'Permite crear nuevos roles en el sistema' },
  { name: 'READ_ROLE',      description: 'Permite consultar los roles existentes' },
  { name: 'UPDATE_ROLE',    description: 'Permite actualizar la información de los roles' },
  { name: 'DELETE_ROLE',    description: 'Permite eliminar roles del sistema' },

  { name: 'CREATE_PERMISSION', description: 'Permite crear nuevos permisos en el sistema' },
  { name: 'READ_PERMISSION',   description: 'Permite consultar los permisos existentes' },
  { name: 'UPDATE_PERMISSION', description: 'Permite actualizar la información de los permisos' },
  { name: 'DELETE_PERMISSION', description: 'Permite eliminar permisos del sistema' },

  { name: 'ASSIGN_ROLE_PERMISSION', description: 'Permite asociar o eliminar permisos de un rol' },

  { name: 'CREATE_BOOK',    description: 'Permite registrar nuevos libros en el catálogo' },
  { name: 'READ_BOOK',      description: 'Permite consultar libros del catálogo' },
  { name: 'UPDATE_BOOK',    description: 'Permite actualizar la información de los libros' },
  { name: 'DELETE_BOOK',    description: 'Permite eliminar libros del catálogo' },

  { name: 'CREATE_CATEGORY',    description: 'Permite crear nuevas categorías' },
  { name: 'READ_CATEGORY',      description: 'Permite consultar las categorías' },
  { name: 'UPDATE_CATEGORY',    description: 'Permite actualizar categorías' },
  { name: 'DELETE_CATEGORY',    description: 'Permite eliminar categorías' },

  { name: 'CREATE_AUTHOR',      description: 'Permite registrar nuevos autores' },
  { name: 'READ_AUTHOR',        description: 'Permite consultar autores' },
  { name: 'UPDATE_AUTHOR',      description: 'Permite actualizar la información de los autores' },
  { name: 'DELETE_AUTHOR',      description: 'Permite eliminar autores' },

  { name: 'CREATE_PUBLISHER',   description: 'Permite registrar nuevas editoriales' },
  { name: 'READ_PUBLISHER',     description: 'Permite consultar editoriales' },
  { name: 'UPDATE_PUBLISHER',   description: 'Permite actualizar editoriales' },
  { name: 'DELETE_PUBLISHER',   description: 'Permite eliminar editoriales' },

  { name: 'CREATE_PHYSICAL_COPY', description: 'Permite registrar ejemplares físicos' },
  { name: 'READ_PHYSICAL_COPY',   description: 'Permite consultar ejemplares físicos' },
  { name: 'UPDATE_PHYSICAL_COPY', description: 'Permite actualizar el estado o ubicación de los ejemplares' },
  { name: 'DELETE_PHYSICAL_COPY', description: 'Permite eliminar ejemplares físicos' },

  { name: 'CREATE_LOAN',     description: 'Permite registrar préstamos de libros' },
  { name: 'READ_LOAN',       description: 'Permite consultar préstamos' },
  { name: 'UPDATE_LOAN',     description: 'Permite actualizar préstamos' },
  { name: 'DELETE_LOAN',     description: 'Permite eliminar préstamos' },

  { name: 'CREATE_REQUEST',  description: 'Permite crear solicitudes de préstamo' },
  { name: 'READ_REQUEST',    description: 'Permite consultar solicitudes de préstamo' },
  { name: 'APPROVE_REQUEST', description: 'Permite aprobar o rechazar solicitudes de préstamo' },
  { name: 'CANCEL_REQUEST',  description: 'Permite cancelar solicitudes de préstamo' },

  { name: 'CREATE_FINE',          description: 'Permite registrar multas' },
  { name: 'READ_FINE',            description: 'Permite consultar multas' },
  { name: 'PAY_FINE',             description: 'Permite registrar el pago de multas' },
  { name: 'FORGIVE_FINE',         description: 'Permite condonar multas' },

  { name: 'CREATE_SUSPENSION',    description: 'Permite registrar suspensiones a usuarios' },
  { name: 'READ_SUSPENSION',      description: 'Permite consultar suspensiones' },
  { name: 'REVOKE_SUSPENSION',    description: 'Permite revocar suspensiones' },

  { name: 'CREATE_INCIDENT',  description: 'Permite reportar incidencias' },
  { name: 'READ_INCIDENT',    description: 'Permite consultar incidencias' },
  { name: 'UPDATE_INCIDENT',  description: 'Permite actualizar o resolver incidencias' },

  { name: 'READ_REPORT',      description: 'Permite consultar reportes administrativos' },
  { name: 'CREATE_REPORT',    description: 'Permite generar reportes administrativos' },

  { name: 'READ_NOTIFICATION',  description: 'Permite consultar las notificaciones de los usuarios' },
];

export class PermissionsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<Permission[]> {
    const created: Permission[] = [];

    for (const perm of PERMISSION_CATALOG) {
      const existing = await this.prisma.permission.findUnique({
        where: { name: perm.name },
      });
      if (existing) {
        created.push(existing);
        continue;
      }
      const permission = await this.prisma.permission.create({
        data: { name: perm.name, description: perm.description },
      });
      created.push(permission);
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.permission.deleteMany({
      where: { name: { in: PERMISSION_CATALOG.map((p) => p.name) } },
    });
    return deleted.count;
  }
}