import { ApiProperty } from '@nestjs/swagger';
import { RolePermissionNested } from '../entities/role.entity.js';

export class RoleResponse {
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
    type: () => RolePermissionNested,
    isArray: true,
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
}

export class PaginatedRolesResponse {
  @ApiProperty({
    type: [RoleResponse],
    description: 'Listado de roles de la página actual',
  })
  data!: RoleResponse[];

  @ApiProperty({ example: 4, description: 'Número total de roles activos' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 1, description: 'Número total de páginas' })
  totalPages!: number;
}

export class RoleDeleteResponse {
  @ApiProperty({
    example: 'Rol eliminado correctamente',
    description: 'Mensaje de confirmación de la eliminación lógica',
  })
  message!: string;
}

export class RoleErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'El rol ya existe',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Conflict',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
