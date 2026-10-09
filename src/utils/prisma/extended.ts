import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client.js';

// Función para crear una instancia extendida de PrismaClient con el adaptador PostgreSQL
export function createExtendedPrismaClient(client: PrismaClient) {
  return client.$extends({
    model: {
      $allModels: {
        async softDelete<T>(this: T, id: number) {
          const context = this as any;
          return context.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        },
      },
    },
    query: {
      $allModels: {
        async count({ model, args, query, operation }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ model, args, query, operation }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findMany({ model, args, query, operation }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findUnique({ model, args, query, operation }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async delete({ model, args, query, operation }) {
          const context = (this as any)[model];
          return context.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
}

export type ExtendedPrismaClient = ReturnType<
  typeof createExtendedPrismaClient
>;
