import { Module } from '@nestjs/common';
import { ReportService } from './report.service.js';
import { ReportController } from './report.controller.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
