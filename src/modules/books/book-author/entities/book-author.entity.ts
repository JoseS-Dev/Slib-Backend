import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../book/entities/book.entity.js';
import { Author } from '../../authors/entities/author.entity.js';

export class BookAuthor {
  @ApiProperty({
    example: 1,
    description: 'Identificador del libro',
  })
  bookId!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del autor',
  })
  authorId!: number;

  @ApiProperty({
    type: () => Book,
    description: 'Datos del libro asociado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  book?: Book | null;

  @ApiProperty({
    type: () => Author,
    description: 'Datos del autor asociado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  author?: Author | null;
}
