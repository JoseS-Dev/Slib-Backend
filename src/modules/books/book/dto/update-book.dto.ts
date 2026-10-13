import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { UpdateBookSchema } from '../../../../shared/index.js';

export class UpdateBookDto extends createZodDto(UpdateBookSchema) {
  @ApiProperty({
    example: 2,
    description: 'Identificador de la categoría del libro',
    required: false,
  })
  declare categoryId?: number;

  @ApiProperty({
    example: 5,
    description: 'Identificador de la subcategoría del libro',
    required: false,
  })
  declare subcategoryId?: number;

  @ApiProperty({
    example: 3,
    description: 'Identificador de la editorial del libro',
    required: false,
  })
  declare publisherId?: number;

  @ApiProperty({
    example: 'Cien años de soledad',
    description: 'Título del libro',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  declare title?: string;

  @ApiProperty({
    example: '9780307474728',
    description: 'ISBN del libro (10-13 caracteres)',
    required: false,
    minLength: 10,
    maxLength: 13,
  })
  declare isbn?: string;

  @ApiProperty({
    example:
      'Una novela que narra la historia de la familia Buendía a lo largo de siete generaciones.',
    description: 'Descripción del libro',
    required: false,
    maxLength: 1000,
  })
  declare description?: string;

  @ApiProperty({
    example: '1967-05-30T00:00:00.000Z',
    description: 'Fecha de publicación del libro',
    required: false,
  })
  declare datePublished?: Date;

  @ApiProperty({
    example: 'https://example.com/covers/cien-anos.jpg',
    description: 'URL de la portada del libro',
    required: false,
  })
  declare frontCoverUrl?: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'Tipo MIME de la portada',
    required: false,
  })
  declare mimeType?: string;

  @ApiProperty({
    example: 245678,
    description: 'Tamaño de la portada en bytes',
    required: false,
  })
  declare fileSize?: number;
}
