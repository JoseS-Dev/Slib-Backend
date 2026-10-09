import { Role } from '../../../auth/roles/entities/role.entity.js';
import { Permission } from '../../permissions/entities/permission.entity.js';

export class RolePermission {
  roleId!: number;
  permissionId!: number;
  role?: Role | null;
  permission?: Permission | null;
}
