import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service.js';
import { RolePermissionController } from './role-permission.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
})
export class RolePermissionModule {}
