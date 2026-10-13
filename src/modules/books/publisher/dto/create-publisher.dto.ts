import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createPublisherSchema } from '../../../../shared/index.js';

export class CreatePublisherDto extends createZodDto(createPublisherSchema) {
  @ApiProperty({
    example: 'Editorial Sudamericana',
    description: 'Nombre de la editorial',
    minLength: 1,
    maxLength: 100,
  })
  declare name: string;

  @ApiProperty({
    example: 'Editorial argentina fundada en 1939',
    description: 'Descripción de la editorial',
    required: false,
    maxLength: 1000,
  })
  declare description?: string;
}
