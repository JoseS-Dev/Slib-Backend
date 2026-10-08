import { Module } from '@nestjs/common';
import { LoanModule } from './loan/loan.module.js';
import { RequestModule } from './request/request.module.js';

@Module({
  imports: [RequestModule, LoanModule],
})
export class RequestsModule {}