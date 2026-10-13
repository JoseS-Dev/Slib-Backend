import { Module } from '@nestjs/common';
import { PublisherService } from './publisher.service.js';
import { PublisherController } from './publisher.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [PublisherController],
  providers: [PublisherService],
})
export class PublisherModule {}
