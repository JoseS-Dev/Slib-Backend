import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../../security/permissions/entities/permission.entity.js';

export class RolePermissionNested {
  @ApiProperty({ example: 1, description: 'Identificador del rol' })
  roleId!: number;

  @ApiProperty({ example: 5, description: 'Identificador del permiso' })
  permissionId!: number;

  @ApiProperty({
    description: 'Datos del permiso asociado',
    required: false,
    nullable: true,
  })
  permission?: Permission | null;
}

export class Role {
  @ApiProperty({ example: 1, description: 'Identificador único del rol' })
  id!: number;

  @ApiProperty({ example: 'Administrador', description: 'Nombre del rol' })
  name!: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el rol es el rol por defecto del sistema',
    required: false,
    nullable: true,
  })
  isDefault?: boolean | null;

  @ApiProperty({

    description: 'Permisos asociados al rol',
    required: false,
  })
  permissions?: RolePermissionNested[];

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del rol',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del rol',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description:
      'Fecha de eliminación lógica (soft delete). null si está activo',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;
}
