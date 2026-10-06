import { Module } from '@nestjs/common';
import { PermissionsModule } from './permissions/permissions.module.js';
import { RolePermissionModule } from './role-permission/role-permission.module.js';

@Module({
    imports: [PermissionsModule, RolePermissionModule],
})
export class SecurityModule {}