import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async root(): Promise<object> {
    return {
      message: 'API SLIB',
      timestamp: new Date().toISOString(),
    };
  }

  async ping(): Promise<object> {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }

  async health(): Promise<object> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        usage: process.memoryUsage(),
        rss: process.memoryUsage().rss,
        external: process.memoryUsage().external,
        heapTotal: process.memoryUsage().heapTotal,
      },
      database: {
        status: (await this.prismaService.$queryRaw`SELECT 1`)
          ? 'healthy'
          : 'unhealthy',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
