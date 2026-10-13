import { Module } from '@nestjs/common';
import { ItemsService } from './items.service.js';
import { ItemsController } from './items.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
