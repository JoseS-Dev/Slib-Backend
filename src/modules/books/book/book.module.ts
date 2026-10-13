import { Module } from '@nestjs/common';
import { BookService } from './book.service.js';
import { BookController } from './book.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
