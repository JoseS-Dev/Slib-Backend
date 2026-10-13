import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../../books/book/entities/book.entity.js';

export class FavoriteResponse {
  @ApiProperty({ example: 1, description: 'Identificador único del favorito' })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario propietario del favorito',
  })
  userId!: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del libro marcado como favorito',
  })
  bookId!: number;

  @ApiProperty({
    example: true,
    description: 'Indica si el favorito está activo',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del favorito',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del favorito',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Datos del libro favorito (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  book?: Book;
}

export class PaginatedFavoritesResponse {
  @ApiProperty({
    description: 'Listado de favoritos de la página actual',
  })
  data!: FavoriteResponse[];

  @ApiProperty({
    example: 26,
    description: 'Número total de favoritos del usuario',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Número total de páginas' })
  totalPages!: number;
}

export class FavoriteDeleteResponse {
  @ApiProperty({
    example: 'Favorito eliminado correctamente.',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class FavoriteErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'El usuario ya tiene este libro en favoritos.',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Conflict',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
