import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { settings } from '../config/settings.config.js'
import { PrismaClient } from '../../generated/prisma/client.js'
import type { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import type { ExtendedPrismaClient } from "../utils/prisma/extended.js";
import { createExtendedPrismaClient } from "../utils/prisma/extended.js";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public extended: ExtendedPrismaClient;
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: settings.server.databaseUrl,
      }),
    });
    this.extended = createExtendedPrismaClient(this);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}