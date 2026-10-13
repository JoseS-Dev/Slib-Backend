import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createPhysicalCopySchema } from '../../../../shared/index.js';

export class CreatePhysicalDto extends createZodDto(createPhysicalCopySchema) {
  @ApiProperty({
    example: 4,
    description: 'Identificador del libro al que pertenece el ejemplar',
  })
  declare bookId: number;

  @ApiProperty({
    example: 'CP-001',
    description: 'Número de copia del ejemplar',
    minLength: 1,
    maxLength: 50,
  })
  declare copyNumber: string;

  @ApiProperty({
    example: 'Estantería A-3',
    description: 'Ubicación física del ejemplar',
    required: false,
    maxLength: 100,
  })
  declare ubication?: string;
}
