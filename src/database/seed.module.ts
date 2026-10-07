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
      provide: SeedServices,
      useFactory: (
        permissionsSeeder: PermissionsSeeder,
        rolesSeeder: RolesSeeder,
        rolePermissionSeeder: RolePermissionSeeder,
        usersSeeder: UsersSeeder,
        sessionsSeeder: SessionsSeeder,
        categoriesSeeder: CategoriesSeeder,
        subcategoriesSeeder: SubcategoriesSeeder,
      ) =>
        new SeedServices(
          permissionsSeeder,
          rolesSeeder,
          rolePermissionSeeder,
          usersSeeder,
          sessionsSeeder,
          categoriesSeeder,
          subcategoriesSeeder,
        ),
      inject: [
        PermissionsSeeder,
        RolesSeeder,
        RolePermissionSeeder,
        UsersSeeder,
        SessionsSeeder,
        CategoriesSeeder,
        SubcategoriesSeeder,
      ],
    },
  ],
  exports: [SeedServices],
})
export class SeedModule {}