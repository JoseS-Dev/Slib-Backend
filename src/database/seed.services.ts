import { Injectable, Logger } from '@nestjs/common';
import type { SeedResult } from './interfaces/seed-result.interface.js';
import { emptySeederCounts } from './interfaces/seed-result.interface.js';
import { PermissionsSeeder } from './seeders/permissions.seeder.js';
import { RolesSeeder } from './seeders/roles.seeder.js';
import { RolePermissionSeeder } from './seeders/role-permission.seeder.js';
import { UsersSeeder } from './seeders/users.seeder.js';
import { SessionsSeeder } from './seeders/sessions.seeder.js';
import { CategoriesSeeder } from './seeders/categories.seeder.js';
import { SubcategoriesSeeder } from './seeders/subcategories.seeder.js';
import { PublishersSeeder } from './seeders/publishers.seeder.js';
import { AuthorsSeeder } from './seeders/authors.seeder.js';
import { BooksSeeder } from './seeders/books.seeder.js';
import { BookAuthorSeeder } from './seeders/book-author.seeder.js';
import { PhysicalCopiesSeeder } from './seeders/physical-copies.seeder.js';
import { RequestsSeeder } from './seeders/requests.seeder.js';
import { LoansSeeder } from './seeders/loans.seeder.js';

@Injectable()
export class SeedServices {
  private readonly logger = new Logger(SeedServices.name);

  constructor(
    private readonly permissionsSeeder: PermissionsSeeder,
    private readonly rolesSeeder: RolesSeeder,
    private readonly rolePermissionSeeder: RolePermissionSeeder,
    private readonly usersSeeder: UsersSeeder,
    private readonly sessionsSeeder: SessionsSeeder,
    private readonly categoriesSeeder: CategoriesSeeder,
    private readonly subcategoriesSeeder: SubcategoriesSeeder,
    private readonly publishersSeeder: PublishersSeeder,
    private readonly authorsSeeder: AuthorsSeeder,
    private readonly booksSeeder: BooksSeeder,
    private readonly bookAuthorSeeder: BookAuthorSeeder,
    private readonly physicalCopiesSeeder: PhysicalCopiesSeeder,
    private readonly requestsSeeder: RequestsSeeder,
    private readonly loansSeeder: LoansSeeder,
  ) {}

  /**
   * Ejecuta la semilla completa de los módulos auth, security, categories
   * y books. El orden respeta las claves foráneas.
   */
  async run(): Promise<SeedResult> {
    const startedAt = new Date();
    const errors: string[] = [];
    const counts = emptySeederCounts();

    try {
      this.logger.log('Iniciando seed de la base de datos...');

      // 1. Permisos
      const permissions = await this.permissionsSeeder.run();
      counts.permissions = permissions.length;
      this.logger.log(`Permisos: ${counts.permissions}`);

      // 2. Roles
      const roles = await this.rolesSeeder.run();
      counts.roles = roles.length;
      this.logger.log(`Roles: ${counts.roles}`);

      // 3. Asociación rol-permiso
      counts.rolePermissions = await this.rolePermissionSeeder.run(roles, permissions);
      this.logger.log(`Asociación rol-permiso: ${counts.rolePermissions}`);

      // 4. Usuarios
      const users = await this.usersSeeder.run(roles, { totalUsers: 15 });
      counts.users = users.length;
      this.logger.log(`Usuarios: ${counts.users}`);

      // 5. Categorías
      const categories = await this.categoriesSeeder.run();
      counts.categories = categories.length;
      this.logger.log(`Categorías: ${counts.categories}`);

      // 6. Subcategorías (dependen de categorías)
      const subcategories = await this.subcategoriesSeeder.run(categories);
      counts.subcategories = subcategories.length;
      this.logger.log(`Subcategorías: ${counts.subcategories}`);

      // 7. Editoriales
      const publishers = await this.publishersSeeder.run();
      counts.publishers = publishers.length;
      this.logger.log(`Editoriales: ${counts.publishers}`);

      // 8. Autores
      const authors = await this.authorsSeeder.run();
      counts.authors = authors.length;
      this.logger.log(`Autores: ${counts.authors}`);

      // 9. Libros (dependen de categorías, subcategorías y editoriales)
      const { books, authorIndexesByIsbn } = await this.booksSeeder.run(
        categories,
        publishers,
        subcategories,
      );
      counts.books = books.length;
      this.logger.log(`Libros: ${counts.books}`);

      // 10. Asociación libro-autor
      counts.bookAuthors = await this.bookAuthorSeeder.run(books, authors, authorIndexesByIsbn);
      this.logger.log(`Asociación libro-autor: ${counts.bookAuthors}`);

      // 11. Copias físicas (dependen de libros)
      const physicalCopies = await this.physicalCopiesSeeder.run(books);
      counts.physicalCopies = physicalCopies.length;
      this.logger.log(`Copias físicas: ${counts.physicalCopies}`);

      // 12. Solicitudes (Request + RequestItem) — dependen de usuarios y copias físicas
      const { requests, items } = await this.requestsSeeder.run(users, physicalCopies);
      counts.requests = requests.length;
      counts.requestItems = items.length;
      this.logger.log(`Solicitudes: ${counts.requests} (items: ${counts.requestItems})`);

      // 13. Préstamos — dependen de los items aprobados y de un recepcionista
      const loans = await this.loansSeeder.run(items, users);
      counts.loans = loans.length;
      this.logger.log(`Préstamos: ${counts.loans}`);

      // 14. Sesiones y refresh tokens
      const sessions = await this.sessionsSeeder.run(users, {
        sessionProbability: 0.6,
        maxSessionsPerUser: 2,
      });
      counts.sessions = sessions.length;
      counts.refreshTokens = sessions.reduce(
        (acc, bundle) => acc + bundle.refreshTokens.length,
        0,
      );
      this.logger.log(`Sesiones: ${counts.sessions}`);
      this.logger.log(`Refresh tokens: ${counts.refreshTokens}`);

      this.logger.log('Seed finalizado correctamente.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido durante el seed';
      errors.push(message);
      this.logger.error(`Error durante el seed: ${message}`, error instanceof Error ? error.stack : undefined);
    }

    const finishedAt = new Date();
    const result: SeedResult = {
      ok: errors.length === 0,
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      counts,
      errors,
    };

    return result;
  }

  /**
   * Limpia los datos sembrados en orden inverso al de inserción.
   * Pensado para limpiar entre ejecuciones de la semilla.
   */
  async clear(): Promise<SeedResult> {
    const startedAt = new Date();
    const errors: string[] = [];
    const counts = emptySeederCounts();

    try {
      this.logger.log('Iniciando limpieza de la semilla...');

      const sessionResult = await this.sessionsSeeder.clear();
      counts.sessions = sessionResult.sessions;
      counts.refreshTokens = sessionResult.refreshTokens;

      counts.loans = await this.loansSeeder.clear();
      const requestCleanup = await this.requestsSeeder.clear();
      counts.requests = requestCleanup.requests;
      counts.requestItems = requestCleanup.items;

      counts.physicalCopies = await this.physicalCopiesSeeder.clear();
      counts.bookAuthors = await this.bookAuthorSeeder.clear();
      counts.books = await this.booksSeeder.clear();
      counts.authors = await this.authorsSeeder.clear();
      counts.publishers = await this.publishersSeeder.clear();
      counts.subcategories = await this.subcategoriesSeeder.clear();
      counts.categories = await this.categoriesSeeder.clear();
      counts.users = await this.usersSeeder.clear();
      counts.rolePermissions = await this.rolePermissionSeeder.clear();
      counts.roles = await this.rolesSeeder.clear();
      counts.permissions = await this.permissionsSeeder.clear();

      this.logger.log(
        `Limpieza completada. Permisos: ${counts.permissions}, ` +
        `Roles: ${counts.roles}, RolePermission: ${counts.rolePermissions}, ` +
        `Usuarios: ${counts.users}, Categorías: ${counts.categories}, ` +
        `Subcategorías: ${counts.subcategories}, Editoriales: ${counts.publishers}, ` +
        `Autores: ${counts.authors}, Libros: ${counts.books}, ` +
        `LibroAutor: ${counts.bookAuthors}, Copias: ${counts.physicalCopies}, ` +
        `Solicitudes: ${counts.requests}, Items: ${counts.requestItems}, ` +
        `Préstamos: ${counts.loans}, ` +
        `Sesiones: ${counts.sessions}, RefreshTokens: ${counts.refreshTokens}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido durante la limpieza';
      errors.push(message);
      this.logger.error(
        `Error durante la limpieza: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    const finishedAt = new Date();
    return {
      ok: errors.length === 0,
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      counts,
      errors,
    };
  }
}