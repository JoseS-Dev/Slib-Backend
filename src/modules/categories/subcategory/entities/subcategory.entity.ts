import { ApiProperty } from '@nestjs/swagger';

export class Subcategory {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la subcategoría',
  })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'Identificador de la categoría a la que pertenece',
  })
  categoryId!: number;

  @ApiProperty({
    example: 'Ciberpunk',
    description: 'Nombre único de la subcategoría',
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    example: 'Subgénero distópico de ciencia ficción',
    description: 'Descripción opcional de la subcategoría',
    required: false,
    nullable: true,
    maxLength: 255,
  })
  description?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la subcategoría está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la subcategoría',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la subcategoría',
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
