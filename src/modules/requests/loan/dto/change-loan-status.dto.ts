import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '../../../../../generated/prisma/enums.js';

export class ChangeLoanStatusDto {
  @ApiProperty({
    example: LoanStatus.Devuelto,
    description: 'Nuevo estado del préstamo',
    enum: LoanStatus,
  })
  newStatus!: LoanStatus;
}
