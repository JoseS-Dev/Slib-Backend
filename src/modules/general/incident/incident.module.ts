import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service.js';
import { IncidentController } from './incident.controller.js';

@Module({
  controllers: [IncidentController],
  providers: [IncidentService],
})
export class IncidentModule {}
