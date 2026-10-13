import { ApiProperty } from '@nestjs/swagger';
import { Publisher } from '../entities/publisher.entity.js';
import { Book } from '../../book/entities/book.entity.js';

export class PublisherResponse {
  @ApiProperty({ example: 1, description: 'Identificador único de la editorial' })
  id!: number;

  @ApiProperty({
    example: 'Editorial Sudamericana',
    description: 'Nombre de la editorial',
  })
  name!: string;

  @ApiProperty({
    example: 'Editorial argentina fundada en 1939',
    description: 'Descripción de la editorial',
    required: false,
    nullable: true,
  })
  description?: string | null;

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
    description: 'Libros publicados por la editorial (opcional)',
    required: false,
  })
  books?: Book[] | null;
}

export class PaginatedPublishersResponse {
  @ApiProperty({
    description: 'Listado de editoriales de la página actual',
  })
  data!: PublisherResponse[];

  @ApiProperty({
    example: 18,
    description: 'Número total de editoriales',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 2, description: 'Número total de páginas' })
  totalPages!: number;
}

export class PublisherDeleteResponse {
  @ApiProperty({
    example: 'Publisher eliminado correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class PublisherErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Ya existe un publisher con el mismo nombre',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Conflict',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
