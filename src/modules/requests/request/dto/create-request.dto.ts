import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createRequestSchema } from '../../../../shared/index.js';

export class CreateRequestDto extends createZodDto(createRequestSchema) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que crea la solicitud',
  })
  declare userId: number;

  @ApiProperty({
    example: 'Solicitud de libro de matemáticas',
    description: 'Título de la solicitud',
    maxLength: 100,
  })
  declare titleRequest: string;

  @ApiProperty({
    example: 'Necesito el libro para el primer parcial de cálculo',
    description: 'Descripción de la solicitud',
    required: false,
    maxLength: 500,
  })
  declare descriptionRequest?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description:
      'Lista de items (ejemplares físicos) asociados a la solicitud',
    required: false,
  })
  declare items?: { physicalCopyId: number }[];
}
