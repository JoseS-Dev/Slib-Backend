import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../book/entities/book.entity.js';

export class Publisher {
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
    example: null,
    description: 'Fecha de eliminación lógica',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiProperty({
    type: () => [Book],
    description: 'Libros publicados por la editorial (opcional)',
    required: false,
  })
  books?: Book[];
}
