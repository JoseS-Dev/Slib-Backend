import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
