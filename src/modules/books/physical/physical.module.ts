import { Module } from '@nestjs/common';
import { PhysicalService } from './physical.service.js';
import { PhysicalController } from './physical.controller.js';

@Module({
  controllers: [PhysicalController],
  providers: [PhysicalService],
})
export class PhysicalModule {}
