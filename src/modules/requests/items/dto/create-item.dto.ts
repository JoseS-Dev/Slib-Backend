import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { itemsSchemaCreate } from '../../../../shared/dtos/index.js';

export class CreateItemDto extends createZodDto(itemsSchemaCreate) {
  @ApiProperty({
    example: 4,
    description: 'Identificador de la solicitud a la que pertenece el item',
  })
  declare requestId: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del ejemplar físico asociado al item',
  })
  declare physicalCopyId: number;
}
