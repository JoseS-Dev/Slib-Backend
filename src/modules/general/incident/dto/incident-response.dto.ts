import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Physical } from '../../../books/physical/entities/physical.entity.js';
import { Loan } from '../../../requests/loan/entities/loan.entity.js';

export class IncidentResponse {
  @ApiProperty({ example: 1, description: 'Identificador único del incidente' })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que reportó el incidente',
  })
  userId!: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del ejemplar físico relacionado',
    required: false,
    nullable: true,
  })
  physicalCopyId?: number | null;

  @ApiProperty({
    example: 3,
    description: 'Identificador del préstamo relacionado',
    required: false,
    nullable: true,
  })
  loanId?: number | null;

  @ApiProperty({
    example: 'Libro dañado en la portada',
    description: 'Título del incidente',
  })
  title!: string;

  @ApiProperty({
    example: 'El libro presenta daños en la portada y varias páginas rasgadas.',
    description: 'Descripción detallada del incidente',
  })
  description!: string;

  @ApiProperty({
    example: 'Daño de libro',
    description: 'Tipo o categoría del incidente',
  })
  typeIncident!: string;

  @ApiProperty({
    example: 'Se está evaluando el caso con el equipo de mantenimiento.',
    description: 'Mensaje o comentario del administrador',
    required: false,
    nullable: true,
  })
  messageAdmin?: string | null;

  @ApiProperty({
    example: 'En_Revision',
    description: 'Estado actual del incidente',
  })
  status!: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del incidente',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del incidente',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: () => User,
    description: 'Datos del usuario que reportó el incidente',
    required: false,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    type: () => Physical,
    description: 'Datos del ejemplar físico relacionado',
    required: false,
    nullable: true,
  })
  physical?: Physical | null;

  @ApiProperty({
    type: () => Loan,
    description: 'Datos del préstamo relacionado',
    required: false,
    nullable: true,
  })
  loan?: Loan | null;
}

export class PaginatedIncidentsResponse {
  @ApiProperty({
    type: [IncidentResponse],
    description: 'Listado de incidentes de la página actual',
  })
  data!: IncidentResponse[];

  @ApiProperty({ example: 18, description: 'Número total de incidentes' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 2, description: 'Número total de páginas' })
  totalPages!: number;
}

export class IncidentDeleteResponse {
  @ApiProperty({
    example: 'Incidente eliminado correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class IncidentErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró el incidente',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
