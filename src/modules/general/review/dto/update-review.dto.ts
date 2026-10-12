import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateReviewSchema } from '../../../../shared/index.js';

export class UpdateReviewDto extends createZodDto(updateReviewSchema) {
  @ApiProperty({
    example: 4,
    description: 'Calificación otorgada al libro (1-5)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  declare rating?: number;

  @ApiProperty({
    example: 'Comentario actualizado de la reseña',
    description: 'Comentario de la reseña',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  declare comment?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la reseña está activa',
    required: false,
  })
  declare isActive?: boolean;
}
