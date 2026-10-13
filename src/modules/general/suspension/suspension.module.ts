import { Module } from '@nestjs/common';
import { SuspensionService } from './suspension.service.js';
import { SuspensionController } from './suspension.controller.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [SuspensionController],
  providers: [SuspensionService],
})
export class SuspensionModule {}
