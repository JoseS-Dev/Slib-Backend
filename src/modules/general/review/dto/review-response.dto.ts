import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Book } from '../../../books/book/entities/book.entity.js';

export class ReviewResponse {
  @ApiProperty({ example: 1, description: 'Identificador único de la reseña' })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que escribió la reseña',
  })
  userId!: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del libro reseñado',
  })
  bookId!: number;

  @ApiProperty({
    example: 5,
    description: 'Calificación otorgada (1-5)',
  })
  rating!: number;

  @ApiProperty({
    example:
      'Una novela magistral que mezcla realismo mágico con historia latinoamericana.',
    description: 'Comentario de la reseña',
    required: false,
    nullable: true,
  })
  comment?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la reseña está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la reseña',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la reseña',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: () => User,
    description: 'Datos del usuario que escribió la reseña (opcional)',
    required: false,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    type: () => Book,
    description: 'Datos del libro reseñado (opcional)',
    required: false,
    nullable: true,
  })
  book?: Book;
}

export class PaginatedReviewsResponse {
  @ApiProperty({
    type: [ReviewResponse],
    description: 'Listado de reseñas de la página actual',
  })
  data!: ReviewResponse[];

  @ApiProperty({ example: 27, description: 'Número total de reseñas' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Número total de páginas' })
  totalPages!: number;
}

export class ReviewDeleteResponse {
  @ApiProperty({
    example: 'Reseña eliminada correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class ReviewErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró la reseña',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
