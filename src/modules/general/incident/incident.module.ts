import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service.js';
import { IncidentController } from './incident.controller.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [IncidentController],
  providers: [IncidentService],
})
export class IncidentModule {}
