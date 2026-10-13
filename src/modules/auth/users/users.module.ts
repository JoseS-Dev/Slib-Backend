import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { MailerModule } from '../../mailer/mailer.module.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
