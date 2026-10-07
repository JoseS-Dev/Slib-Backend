import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service.js';
import { AuthorsController } from './authors.controller.js';

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
