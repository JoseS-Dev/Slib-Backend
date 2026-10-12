import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createReviewSchema } from '../../../../shared/index.js';

export class CreateReviewDto extends createZodDto(createReviewSchema) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que escribe la reseña',
  })
  declare userId: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del libro reseñado',
  })
  declare bookId: number;

  @ApiProperty({
    example: 5,
    description: 'Calificación otorgada al libro (1-5)',
    minimum: 1,
    maximum: 5,
  })
  declare rating: number;

  @ApiProperty({
    example:
      'Una novela magistral que mezcla realismo mágico con historia latinoamericana.',
    description: 'Comentario opcional de la reseña',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  declare comment?: string;
}
