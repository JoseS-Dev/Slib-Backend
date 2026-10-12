import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateFavoriteSchema } from '../../../../shared/dtos/index.js';

export class UpdateFavoriteDto extends createZodDto(updateFavoriteSchema) {
  @ApiProperty({
    example: true,
    description: 'Indica si el favorito está activo',
    required: false,
  })
  declare isActive?: boolean;
}
