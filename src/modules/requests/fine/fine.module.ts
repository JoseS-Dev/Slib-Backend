import { Module } from '@nestjs/common';
import { FineService } from './fine.service.js';
import { FineController } from './fine.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [FineController],
  providers: [FineService],
})
export class FineModule {}
