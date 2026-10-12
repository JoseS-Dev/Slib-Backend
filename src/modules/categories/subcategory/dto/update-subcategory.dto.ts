import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { UpdateSubCategorySchema } from '../../../../shared/index.js';

export class UpdateSubcategoryDto extends createZodDto(
  UpdateSubCategorySchema,
) {
  @ApiProperty({
    example: 1,
    description: 'Identificador de la categoría padre',
    required: false,
  })
  declare categoryId?: number;

  @ApiProperty({
    example: 'Ciberpunk',
    description: 'Nombre único de la subcategoría',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  declare name?: string;

  @ApiProperty({
    example: 'Subgénero distópico de ciencia ficción',
    description: 'Descripción opcional de la subcategoría',
    required: false,
    nullable: true,
    maxLength: 255,
  })
  declare description?: string;
}
