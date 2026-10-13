import { ApiProperty } from '@nestjs/swagger';
import { BookAuthor } from '../entities/book-author.entity.js';

export class BookAuthorResponse {
  @ApiProperty({
    example: 1,
    description: 'Identificador del libro',
  })
  bookId!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del autor',
  })
  authorId!: number;

  @ApiProperty({
    type: () => BookAuthor,
    description: 'Datos del libro y del autor (opcional, presente en includes)',
    required: false,
  })
  book?: BookAuthor;
  author?: BookAuthor;
}

export class PaginatedBookAuthorsResponse {
  @ApiProperty({
    type: [BookAuthorResponse],
    description: 'Listado de relaciones libro-autor de la página actual',
  })
  data!: BookAuthorResponse[];

  @ApiProperty({
    example: 50,
    description: 'Número total de relaciones',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Número total de páginas' })
  totalPages!: number;
}

export class BookAuthorDeleteResponse {
  @ApiProperty({
    example: 'Relación entre libro y autor eliminada correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class BookAuthorErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró el libro con el ID proporcionado',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
