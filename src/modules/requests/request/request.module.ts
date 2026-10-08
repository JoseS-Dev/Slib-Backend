import { Module } from '@nestjs/common';
import { RequestService } from './request.service.js';
import { RequestController } from './request.controller.js';

@Module({
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
