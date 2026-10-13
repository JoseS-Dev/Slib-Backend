import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../book/entities/book.entity.js';

export class Author {
  @ApiProperty({ example: 1, description: 'Identificador único del autor' })
  id!: number;

  @ApiProperty({ example: 'Gabriel', description: 'Nombre del autor' })
  firstName!: string;

  @ApiProperty({ example: 'García Márquez', description: 'Apellido del autor' })
  lastName!: string;

  @ApiProperty({
    example:
      'Escritor colombiano, ganador del Premio Nobel de Literatura en 1982',
    description: 'Biografía del autor',
    required: false,
    nullable: true,
  })
  biography?: string | null;

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
    description: 'Libros asociados al autor (opcional, presente en includes)',
    required: false,
  })
  books?: Book[] | null;
}
