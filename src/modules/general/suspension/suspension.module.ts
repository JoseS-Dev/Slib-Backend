import { Module } from '@nestjs/common';
import { SuspensionService } from './suspension.service.js';
import { SuspensionController } from './suspension.controller.js';

@Module({
  controllers: [SuspensionController],
  providers: [SuspensionService],
})
export class SuspensionModule {}
