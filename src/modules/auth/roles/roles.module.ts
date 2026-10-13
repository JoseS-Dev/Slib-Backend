import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { RolesController } from './roles.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
