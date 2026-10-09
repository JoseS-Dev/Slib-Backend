import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module.js';
import { AuthorsModule } from './authors/authors.module.js';
import { BookAuthorModule } from './book-author/book-author.module.js';
import { PublisherModule } from './publisher/publisher.module.js';
import { PhysicalModule } from './physical/physical.module.js';

@Module({
  imports: [
    BookModule,
    AuthorsModule,
    BookAuthorModule,
    PublisherModule,
    PhysicalModule,
  ],
})
export class BooksModule {}
