import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async root() {
    return await this.appService.root();
  }

  @Get('ping')
  async ping() {
    return await this.appService.ping();
  }

  @Get('health')
  async health(){
    return await this.appService.health();
  }
}
