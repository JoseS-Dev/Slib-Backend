import { Module } from '@nestjs/common';
import { FineService } from './fine.service.js';
import { FineController } from './fine.controller.js';

@Module({
  controllers: [FineController],
  providers: [FineService],
})
export class FineModule {}
