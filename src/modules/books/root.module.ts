import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module.js';
import { AuthorsModule } from './authors/authors.module.js';

@Module({
  imports: [BookModule, AuthorsModule],
})
export class BooksModule {}