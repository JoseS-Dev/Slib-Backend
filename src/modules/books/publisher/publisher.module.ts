import { Module } from '@nestjs/common';
import { PublisherService } from './publisher.service.js';
import { PublisherController } from './publisher.controller.js';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService],
})
export class PublisherModule {}
