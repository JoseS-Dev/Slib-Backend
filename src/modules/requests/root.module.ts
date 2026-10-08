import { Module } from '@nestjs/common';
import { RequestModule } from './request/request.module.js';

@Module({
  imports: [RequestModule],
})
export class RequestsModule {}