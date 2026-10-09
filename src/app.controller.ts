import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Roles } from './common/decorators/roles.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Roles('Administrador')
  async root() {
    return await this.appService.root();
  }

  @Get('ping')
  @Roles('Administrador')
  async ping() {
    return await this.appService.ping();
  }

  @Get('health')
  @Roles('Administrador')
  async health() {
    return await this.appService.health();
  }
}
