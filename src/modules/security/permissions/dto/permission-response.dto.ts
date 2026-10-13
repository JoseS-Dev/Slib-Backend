import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponse {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del permiso',
  })
  id!: number;

  @ApiProperty({
    example: 'Crear usuarios',
    description: 'Nombre único del permiso en el sistema',
  })
  name!: string;

  @ApiProperty({
    example: 'Permite crear nuevos usuarios en el sistema',
    description: 'Descripción del permiso',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del permiso',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del permiso',
  })
  updatedAt!: Date;
}

export class PaginatedPermissionsResponse {
  @ApiProperty({
    description: 'Listado de permisos de la página actual',
  })
  data!: PermissionResponse[];

  @ApiProperty({
    example: 55,
    description: 'Número total de permisos activos',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Número de la página actual',
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de registros por página',
  })
  limit!: number;

  @ApiProperty({
    example: 6,
    description: 'Número total de páginas',
  })
  totalPages!: number;
}

export class PermissionDeleteResponse {
  @ApiProperty({
    example: 'Permiso eliminado exitosamente',
    description: 'Mensaje de confirmación de la eliminación lógica',
  })
  message!: string;
}

export class PermissionErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Ya existe el permiso',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
