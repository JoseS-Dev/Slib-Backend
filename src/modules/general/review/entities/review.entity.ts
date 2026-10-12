import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Book } from '../../../books/book/entities/book.entity.js';

export class Review {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la reseña',
  })
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
    description: 'Calificación otorgada al libro (1-5)',
    minimum: 1,
    maximum: 5,
  })
  rating!: number;

  @ApiProperty({
    example:
      'Una novela magistral que mezcla realismo mágico con historia latinoamericana.',
    description: 'Comentario opcional de la reseña',
    required: false,
    nullable: true,
    maxLength: 500,
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
