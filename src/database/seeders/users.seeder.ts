import argon2 from 'argon2';
import { fakerES as faker } from '@faker-js/faker';
import type { Role, User } from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

const DEFAULT_PASSWORD_LENGTH = 6;

const generatePassword = (length: number = DEFAULT_PASSWORD_LENGTH): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => {
    const index = faker.number.int({ min: 0, max: chars.length - 1 });
    return chars.charAt(index);
  }).join('');
};

const truncate = (value: string, max: number): string =>
  value.length > max ? value.slice(0, max) : value;

export interface UsersSeedOptions {
  totalUsers?: number;
}

export class UsersSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(roles: Role[], options: UsersSeedOptions = {}): Promise<User[]> {
    const totalUsers = options.totalUsers ?? 15;
    const created: User[] = [];
    const passwordHash = await argon2.hash(
      generatePassword(DEFAULT_PASSWORD_LENGTH),
    );

    const adminRole = roles.find((r) => r.name === 'Administrador');
    const recepcionistaRole = roles.find((r) => r.name === 'Recepcionista');
    const bibliotecarioRole = roles.find((r) => r.name === 'Bibliotecario');
    const usuarioRole = roles.find((r) => r.name === 'Usuario');

    if (
      !adminRole ||
      !recepcionistaRole ||
      !bibliotecarioRole ||
      !usuarioRole
    ) {
      throw new Error(
        'Roles base no encontrados. Ejecuta primero el seeder de roles.',
      );
    }

    // Usuario administrador conocido para login
    const adminEmail = 'admin@slib.com';
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (!existingAdmin) {
      const adminPassword = await argon2.hash('secreto1');
      const admin = await this.prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'Principal',
          userName: 'admin',
          email: adminEmail,
          password: adminPassword,
          phoneNumber: '5551111111',
          verified: true,
          roleId: adminRole.id,
        },
      });
      created.push(admin);
    } else {
      created.push(existingAdmin);
    }

    // Usuario regular conocido para login
    const userEmail = 'usuario@slib.com';
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!existingUser) {
      const userPassword = await argon2.hash('secreto1');
      const user = await this.prisma.user.create({
        data: {
          firstName: 'Juan',
          lastName: 'Pérez',
          userName: 'juanperez',
          email: userEmail,
          password: userPassword,
          phoneNumber: '5552222222',
          verified: true,
          roleId: usuarioRole.id,
        },
      });
      created.push(user);
    } else {
      created.push(existingUser);
    }

    // Recepcionista de prueba
    const recepcionistaEmail = 'recepcion@slib.com';
    const existingRecep = await this.prisma.user.findUnique({
      where: { email: recepcionistaEmail },
    });
    if (!existingRecep) {
      const recepPassword = await argon2.hash('secreto1');
      const recep = await this.prisma.user.create({
        data: {
          firstName: 'María',
          lastName: 'González',
          userName: 'recepcion',
          email: recepcionistaEmail,
          password: recepPassword,
          phoneNumber: '5553333333',
          verified: true,
          roleId: recepcionistaRole.id,
        },
      });
      created.push(recep);
    } else {
      created.push(existingRecep);
    }

    // Usuarios aleatorios con faker
    const usedEmails = new Set(created.map((u) => u.email));
    let createdRandom = 0;
    let attempts = 0;
    const maxAttempts = totalUsers * 3;

    while (createdRandom < totalUsers && attempts < maxAttempts) {
      attempts++;
      const firstName = truncate(faker.person.firstName(), 50);
      const lastName = truncate(faker.person.lastName(), 50);
      const baseUserName = faker.internet
        .username({ firstName, lastName })
        .toLowerCase();
      const userName =
        truncate(baseUserName.replace(/[^a-z0-9._-]/g, ''), 50) ||
        `user${attempts}`;
      const email = truncate(
        faker.internet.email({ firstName, lastName }).toLowerCase(),
        100,
      );
      if (usedEmails.has(email)) continue;

      const phoneNumber = faker.string.numeric({ length: 10 });
      const role = faker.helpers.arrayElement([
        usuarioRole,
        usuarioRole,
        usuarioRole,
        recepcionistaRole,
        bibliotecarioRole,
      ]);

      try {
        const user = await this.prisma.user.create({
          data: {
            firstName,
            lastName,
            userName,
            email,
            password: passwordHash,
            phoneNumber,
            verified: faker.datatype.boolean({ probability: 0.7 }),
            isActive: faker.datatype.boolean({ probability: 0.9 }),
            roleId: role.id,
          },
        });
        created.push(user);
        usedEmails.add(email);
        createdRandom++;
      } catch {
        // Ignorar colisiones únicas y seguir intentando
      }
    }

    return created;
  }

  async clear(): Promise<number> {
    // El seed crea usuarios conocidos + aleatorios, por lo que hay que
    // eliminar todos antes de borrar roles (FK users_roleId_fkey RESTRICT).
    const deleted = await this.prisma.user.deleteMany({});
    return deleted.count;
  }
}
