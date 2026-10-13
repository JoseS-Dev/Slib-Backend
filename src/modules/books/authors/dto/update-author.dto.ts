import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateAuthorSchema } from '../../../../shared/index.js';

export class UpdateAuthorDto extends createZodDto(updateAuthorSchema) {
  @ApiProperty({
    example: 'Gabriel',
    description: 'Nombre del autor',
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  declare firstName?: string;

  @ApiProperty({
    example: 'García Márquez',
    description: 'Apellido del autor',
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  declare lastName?: string;

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
    description:
      'Identificadores de los libros a asociar al autor (reemplaza la lista actual)',
    required: false,
  })
  declare bookIds?: number[];
}
