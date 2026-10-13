import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponse } from '../../permissions/dto/permission-response.dto.js';

export class RoleSummary {
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

export class RolePermissionResponse {
  @ApiProperty({ example: 1, description: 'Identificador del rol' })
  roleId!: number;

  @ApiProperty({ example: 5, description: 'Identificador del permiso' })
  permissionId!: number;

  @ApiProperty({
    description: 'Información del rol asociado',
    required: false,
    nullable: true,
  })
  role?: RoleSummary | null;

  @ApiProperty({
    description: 'Información del permiso asociado',
    required: false,
    nullable: true,
  })
  permission?: PermissionResponse | null;
}

export class PaginatedRolePermissionsResponse {
  @ApiProperty({
    description: 'Listado de asociaciones rol-permiso de la página actual',
  })
  data!: RolePermissionResponse[];

  @ApiProperty({
    example: 109,
    description: 'Número total de asociaciones activas',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 11, description: 'Número total de páginas' })
  totalPages!: number;
}

export class RolePermissionDeleteResponse {
  @ApiProperty({
    example: 'Relación entre rol y permiso eliminada exitosamente',
    description: 'Mensaje de confirmación de la eliminación',
  })
  message!: string;
}

export class RolePermissionErrorResponse {
  @ApiProperty({ example: 404, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No existe la relación entre el rol y el permiso especificados',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
