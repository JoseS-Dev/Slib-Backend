import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createAuthorSchema } from '../../../../shared/index.js';

export class CreateAuthorDto extends createZodDto(createAuthorSchema) {
  @ApiProperty({
    example: 'Gabriel',
    description: 'Nombre del autor',
    minLength: 1,
    maxLength: 50,
  })
  declare firstName: string;

  @ApiProperty({
    example: 'García Márquez',
    description: 'Apellido del autor',
    minLength: 1,
    maxLength: 50,
  })
  declare lastName: string;

  @ApiProperty({
    example:
      'Escritor colombiano, ganador del Premio Nobel de Literatura en 1982',
    description: 'Biografía del autor',
    required: false,
    maxLength: 1000,
  })
  declare biography?: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Identificadores de los libros a asociar al autor',
    required: false,
  })
  declare bookIds?: number[];
}
