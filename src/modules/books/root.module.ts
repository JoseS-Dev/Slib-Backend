import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module.js';

@Module({
  imports: [BookModule],
})
export class BooksModule {}