import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Book } from '../../../books/book/entities/book.entity.js';

export class Favorite {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del favorito',
  })
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
    description:
      'Datos del usuario propietario (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    description: 'Datos del libro favorito (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  book?: Book;
}
