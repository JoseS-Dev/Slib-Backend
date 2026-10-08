import { Module } from '@nestjs/common';
import { BookAuthorService } from './book-author.service.js';
import { BookAuthorController } from './book-author.controller.js';

@Module({
  controllers: [BookAuthorController],
  providers: [BookAuthorService],
})
export class BookAuthorModule {}
