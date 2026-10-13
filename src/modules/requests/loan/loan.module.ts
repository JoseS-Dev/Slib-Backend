import { Module } from '@nestjs/common';
import { LoanService } from './loan.service.js';
import { LoanController } from './loan.controller.js';
import { NotificationModule } from '../../general/notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
