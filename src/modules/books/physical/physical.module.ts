import { Module } from '@nestjs/common';
import { PhysicalService } from './physical.service.js';
import { PhysicalController } from './physical.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [PhysicalController],
  providers: [PhysicalService],
})
export class PhysicalModule {}
