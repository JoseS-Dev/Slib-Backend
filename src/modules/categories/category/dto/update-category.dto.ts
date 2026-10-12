import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { UpdateCategorySchema } from '../../../../shared/index.js';
import { CreateSubcategoryInlineDto } from './create-category.dto.js';

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {
  @ApiProperty({
    example: 'Ciencia Ficción',
    description: 'Nombre único de la categoría',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  declare name?: string;

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
      'Subcategorías adicionales a crear. Si se envía, se agregan a las subcategorías existentes',
    required: false,
  })
  declare subCategories?: CreateSubcategoryInlineDto[];
}
