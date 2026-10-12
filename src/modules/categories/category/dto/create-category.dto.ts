import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { CreateCategorySchema } from '../../../../shared/index.js';

export class CreateSubcategoryInlineDto {
  @ApiProperty({
    example: 'Ciberpunk',
    description: 'Nombre de la subcategoría',
    minLength: 1,
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
  description?: string;
}

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {
  @ApiProperty({
    example: 'Ciencia Ficción',
    description: 'Nombre único de la categoría',
    minLength: 1,
    maxLength: 100,
  })
  declare name: string;

  @ApiProperty({
    example: 'Libros ambientados en futuros imaginarios y tecnología avanzada',
    description: 'Descripción opcional de la categoría',
    required: false,
    nullable: true,
    maxLength: 255,
  })
  declare description?: string;

  @ApiProperty({
    type: [CreateSubcategoryInlineDto],
    description:
      'Subcategorías que se crearán junto con la categoría (opcional)',
    required: false,
  })
  declare subCategories?: CreateSubcategoryInlineDto[];
}
