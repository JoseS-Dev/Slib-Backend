import { Module } from '@nestjs/common';
import { RequestService } from './request.service.js';
import { RequestController } from './request.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}
