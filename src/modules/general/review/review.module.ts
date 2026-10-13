import { Module } from '@nestjs/common';
import { ReviewService } from './review.service.js';
import { ReviewController } from './review.controller.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
