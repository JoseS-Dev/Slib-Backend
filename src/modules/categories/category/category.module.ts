import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';
import { MailerModule } from '../../mailer/mailer.module.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [MailerModule, NotificationModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
