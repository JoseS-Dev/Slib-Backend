import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { PermissionsController } from './permissions.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
