import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../entities/book.entity.js';
import { Publisher } from '../../publisher/entities/publisher.entity.js';
import { Category } from '../../../categories/category/entities/category.entity.js';
import { Subcategory } from '../../../categories/subcategory/entities/subcategory.entity.js';

export class BookResponse {
  @ApiProperty({ example: 1, description: 'Identificador único del libro' })
  id!: number;

  @ApiProperty({
    example: 2,
    description: 'Identificador de la categoría del libro',
  })
  categoryId!: number;

  @ApiProperty({
    example: 5,
    description: 'Identificador de la subcategoría del libro',
    required: false,
    nullable: true,
  })
  subcategoryId?: number | null;

  @ApiProperty({
    example: 3,
    description: 'Identificador de la editorial del libro',
    required: false,
    nullable: true,
  })
  publisherId?: number | null;

  @ApiProperty({
    example: 'Cien años de soledad',
    description: 'Título del libro',
  })
  title!: string;

  @ApiProperty({
    example: '9780307474728',
    description: 'ISBN del libro',
  })
  isbn!: string;

  @ApiProperty({
    example: 'Una novela que narra la historia de la familia Buendía.',
    description: 'Descripción del libro',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: '1967-05-30T00:00:00.000Z',
    description: 'Fecha de publicación del libro',
    required: false,
    nullable: true,
  })
  datePublished?: Date | null;

  @ApiProperty({
    example: '/uploads/covers/cien-anos-de-soledad.jpg',
    description: 'URL relativa de la portada del libro',
    required: false,
    nullable: true,
  })
  frontCoverUrl?: string | null;

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
    description:
      'Categoría, subcategoría y editorial del libro (opcional, presente en includes)',
    required: false,
  })
  category?: Category | null;

  @ApiProperty({
    description:
      'Categoría, subcategoría y editorial del libro (opcional, presente en includes)',
    required: false,
  })
  subcategory?: Subcategory | null;

  @ApiProperty({
    description:
      'Categoría, subcategoría y editorial del libro (opcional, presente en includes)',
    required: false,
  })
  publisher?: Publisher | null;
}

export class PaginatedBooksResponse {
  @ApiProperty({
    description: 'Listado de libros de la página actual',
  })
  data!: BookResponse[];

  @ApiProperty({
    example: 500,
    description: 'Número total de libros',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 50, description: 'Número total de páginas' })
  totalPages!: number;
}

export class BookDeleteResponse {
  @ApiProperty({
    example: 'Libro eliminado correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class BookErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Los parámetros de paginación son inválidos',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
