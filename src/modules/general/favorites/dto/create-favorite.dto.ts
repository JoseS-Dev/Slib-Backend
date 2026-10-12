import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createFavoriteSchema } from '../../../../shared/dtos/index.js';

export class CreateFavoriteDto extends createZodDto(createFavoriteSchema) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que agrega el favorito',
  })
  declare userId: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del libro a marcar como favorito',
  })
  declare bookId: number;
}
