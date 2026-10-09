import { Module } from '@nestjs/common';
import { LoanModule } from './loan/loan.module.js';
import { RequestModule } from './request/request.module.js';
import { ItemsModule } from './items/items.module.js';
import { FineModule } from './fine/fine.module.js';

@Module({
  imports: [RequestModule, LoanModule, ItemsModule, FineModule],
})
export class RequestsModule {}
