import { ApiProperty } from '@nestjs/swagger';
import { Subcategory } from '../../subcategory/entities/subcategory.entity.js';

export class Category {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la categoría',
  })
  id!: number;

  @ApiProperty({
    example: 'Ciencia Ficción',
    description: 'Nombre único de la categoría',
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    example: 'Libros ambientados en futuros imaginarios y tecnología avanzada',
    description: 'Descripción opcional de la categoría',
    required: false,
    nullable: true,
    maxLength: 255,
  })
  description?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la categoría está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Subcategorías asociadas a la categoría',
    required: false,
  })
  subcategories?: Subcategory[];

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la categoría',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la categoría',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description:
      'Fecha de eliminación lógica (soft delete). null si está activa',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;
}
