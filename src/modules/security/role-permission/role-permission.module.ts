import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service.js';
import { RolePermissionController } from './role-permission.controller.js';

@Module({
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
})
export class RolePermissionModule {}
