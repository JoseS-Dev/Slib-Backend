import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createBookAuthorSchema } from '../../../../shared/index.js';

export class CreateBookAuthorDto extends createZodDto(createBookAuthorSchema) {
  @ApiProperty({
    example: 1,
    description: 'Identificador del libro',
  })
  declare bookId: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del autor',
  })
  declare authorId: number;
}
