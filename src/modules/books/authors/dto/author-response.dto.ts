import { ApiProperty } from '@nestjs/swagger';
import { Author } from '../entities/author.entity.js';

export class AuthorResponse {
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
    type: () => Author,
    description: 'Libros asociados al autor (opcional, presente en includes)',
    required: false,
  })
  books?: Author;
}

export class PaginatedAuthorsResponse {
  @ApiProperty({
    type: [AuthorResponse],
    description: 'Listado de autores de la página actual',
  })
  data!: AuthorResponse[];

  @ApiProperty({
    example: 35,
    description: 'Número total de autores',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 4, description: 'Número total de páginas' })
  totalPages!: number;
}

export class AuthorDeleteResponse {
  @ApiProperty({
    example: 'Autor eliminado correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class AuthorErrorResponse {
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
