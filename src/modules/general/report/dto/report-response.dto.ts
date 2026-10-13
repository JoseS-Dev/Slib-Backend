import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/users/entities/user.entity.js';

export class ReportResponse {
  @ApiProperty({ example: 1, description: 'Identificador único del reporte' })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que generó el reporte',
  })
  userId!: number;

  @ApiProperty({
    example: 'Préstamos activos del mes',
    description: 'Nombre del reporte',
  })
  name!: string;

  @ApiProperty({
    example: 'Listado de préstamos activos durante el mes de enero',
    description: 'Descripción del reporte',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: 'Prestamo',
    description: 'Tipo de reporte',
  })
  typeReport!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el reporte está activo',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del reporte',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del reporte',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Datos del usuario que generó el reporte (opcional)',
    required: false,
    nullable: true,
  })
  user?: User;
}

export class PaginatedReportsResponse {
  @ApiProperty({
    description: 'Listado de reportes de la página actual',
  })
  data!: ReportResponse[];

  @ApiProperty({ example: 8, description: 'Número total de reportes' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 1, description: 'Número total de páginas' })
  totalPages!: number;
}

export class ReportDeleteResponse {
  @ApiProperty({
    example: 'Reporte eliminado correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class ReportErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró el reporte',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
