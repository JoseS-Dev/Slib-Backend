import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../../categories/category/entities/category.entity.js';
import { Subcategory } from '../../../categories/subcategory/entities/subcategory.entity.js';
import { Publisher } from '../../publisher/entities/publisher.entity.js';

export class Book {
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
    example:
      'Una novela que narra la historia de la familia Buendía a lo largo de siete generaciones en el mítico pueblo de Macondo.',
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
    example: 'image/jpeg',
    description: 'Tipo MIME de la portada',
    required: false,
    nullable: true,
  })
  mimeType?: string | null;

  @ApiProperty({
    example: 245678,
    description: 'Tamaño de la portada en bytes',
    required: false,
    nullable: true,
  })
  fileSize?: number | null;

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
    type: () => Category,
    description: 'Categoría del libro (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  category?: Category | null;

  @ApiProperty({
    type: () => Subcategory,
    description: 'Subcategoría del libro (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  subcategory?: Subcategory | null;

  @ApiProperty({
    type: () => Publisher,
    description: 'Editorial del libro (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  publisher?: Publisher | null;
}
