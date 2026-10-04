import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async root(): Promise<Object> {
    return {
      message: "API SLIB",
      timestamp: new Date().toISOString(),
    }
  }

  async ping(): Promise<Object> {
    return {
      message: "pong",
      timestamp: new Date().toISOString(),
    }
  }

  async health(): Promise<Object> {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        usage: process.memoryUsage(),
        rss: process.memoryUsage().rss,
        external: process.memoryUsage().external,
        heapTotal: process.memoryUsage().heapTotal,
      }
    }
  }
}
