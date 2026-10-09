import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
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
import { SeedServices } from './seed.services.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
  ],
  providers: [
    {
      provide: PermissionsSeeder,
      useFactory: (prisma: PrismaService) => new PermissionsSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: RolesSeeder,
      useFactory: (prisma: PrismaService) => new RolesSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: RolePermissionSeeder,
      useFactory: (prisma: PrismaService) => new RolePermissionSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: UsersSeeder,
      useFactory: (prisma: PrismaService) => new UsersSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: SessionsSeeder,
      useFactory: (prisma: PrismaService) => new SessionsSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: CategoriesSeeder,
      useFactory: (prisma: PrismaService) => new CategoriesSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: SubcategoriesSeeder,
      useFactory: (prisma: PrismaService) => new SubcategoriesSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: PublishersSeeder,
      useFactory: (prisma: PrismaService) => new PublishersSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: AuthorsSeeder,
      useFactory: (prisma: PrismaService) => new AuthorsSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: BooksSeeder,
      useFactory: (prisma: PrismaService) => new BooksSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: BookAuthorSeeder,
      useFactory: (prisma: PrismaService) => new BookAuthorSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: PhysicalCopiesSeeder,
      useFactory: (prisma: PrismaService) => new PhysicalCopiesSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: RequestsSeeder,
      useFactory: (prisma: PrismaService) => new RequestsSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: LoansSeeder,
      useFactory: (prisma: PrismaService) => new LoansSeeder(prisma),
      inject: [PrismaService],
    },
    {
      provide: SeedServices,
      useFactory: (
        permissionsSeeder: PermissionsSeeder,
        rolesSeeder: RolesSeeder,
        rolePermissionSeeder: RolePermissionSeeder,
        usersSeeder: UsersSeeder,
        sessionsSeeder: SessionsSeeder,
        categoriesSeeder: CategoriesSeeder,
        subcategoriesSeeder: SubcategoriesSeeder,
        publishersSeeder: PublishersSeeder,
        authorsSeeder: AuthorsSeeder,
        booksSeeder: BooksSeeder,
        bookAuthorSeeder: BookAuthorSeeder,
        physicalCopiesSeeder: PhysicalCopiesSeeder,
        requestsSeeder: RequestsSeeder,
        loansSeeder: LoansSeeder,
      ) =>
        new SeedServices(
          permissionsSeeder,
          rolesSeeder,
          rolePermissionSeeder,
          usersSeeder,
          sessionsSeeder,
          categoriesSeeder,
          subcategoriesSeeder,
          publishersSeeder,
          authorsSeeder,
          booksSeeder,
          bookAuthorSeeder,
          physicalCopiesSeeder,
          requestsSeeder,
          loansSeeder,
        ),
      inject: [
        PermissionsSeeder,
        RolesSeeder,
        RolePermissionSeeder,
        UsersSeeder,
        SessionsSeeder,
        CategoriesSeeder,
        SubcategoriesSeeder,
        PublishersSeeder,
        AuthorsSeeder,
        BooksSeeder,
        BookAuthorSeeder,
        PhysicalCopiesSeeder,
        RequestsSeeder,
        LoansSeeder,
      ],
    },
  ],
  exports: [SeedServices],
})
export class SeedModule {}
