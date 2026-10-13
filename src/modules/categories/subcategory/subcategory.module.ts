import { Module } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service.js';
import { SubcategoryController } from './subcategory.controller.js';
import { MailerModule } from '../../mailer/mailer.module.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [MailerModule, NotificationModule],
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
})
export class SubcategoryModule {}
