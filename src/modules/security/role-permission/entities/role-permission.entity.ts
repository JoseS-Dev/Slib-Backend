import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../auth/roles/entities/role.entity.js';
import { Permission } from '../../permissions/entities/permission.entity.js';

export class RolePermission {
  @ApiProperty({
    example: 1,
    description: 'Identificador del rol asociado',
  })
  roleId!: number;

  @ApiProperty({
    example: 5,
    description: 'Identificador del permiso asociado',
  })
  permissionId!: number;

  @ApiProperty({
    type: () => Role,
    description: 'Datos del rol asociado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  role?: Role | null;

  @ApiProperty({
    type: () => Permission,
    description: 'Datos del permiso asociado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  permission?: Permission | null;
}
