import { ApiProperty } from '@nestjs/swagger';
import { Physical } from '../entities/physical.entity.js';
import { Book } from '../../book/entities/book.entity.js';

export class PhysicalResponse {
  @ApiProperty({ example: 1, description: 'Identificador único del ejemplar' })
  id!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del libro al que pertenece el ejemplar',
  })
  bookId!: number;

  @ApiProperty({
    example: 'CP-001',
    description: 'Número de copia del ejemplar',
  })
  copyNumber!: string;

  @ApiProperty({
    example: 'Estantería A-3',
    description: 'Ubicación física del ejemplar',
    required: false,
    nullable: true,
  })
  ubication?: string | null;

  @ApiProperty({
    example: 'Disponible',
    description: 'Estado actual del ejemplar',
  })
  status!: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del registro',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del registro',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Datos del libro asociado (opcional, presente en includes)',
    required: false,
  })
  book?: Book | null;
}

export class PaginatedPhysicalsResponse {
  @ApiProperty({
    description: 'Listado de ejemplares físicos de la página actual',
  })
  data!: PhysicalResponse[];

  @ApiProperty({
    example: 250,
    description: 'Número total de ejemplares',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 25, description: 'Número total de páginas' })
  totalPages!: number;
}

export class PhysicalDeleteResponse {
  @ApiProperty({
    example: 'Copia física eliminada correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class PhysicalErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Parámetros de paginación invalidos',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
