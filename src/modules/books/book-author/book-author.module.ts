import { Module } from '@nestjs/common';
import { BookAuthorService } from './book-author.service.js';
import { BookAuthorController } from './book-author.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [BookAuthorController],
  providers: [BookAuthorService],
})
export class BookAuthorModule {}
