import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { LoanStatus } from '../../../../../generated/prisma/enums.js';
import { updateLoanSchema } from '../../../../shared/dtos/requests/loan/loan.dtos.js';

export class UpdateLoanDto extends createZodDto(updateLoanSchema) {
  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha en que se realizó el préstamo',
    required: false,
  })
  declare loanDate?: Date;

  @ApiProperty({
    example: '2026-01-30T10:30:00.000Z',
    description: 'Fecha pactada para la devolución',
    required: false,
  })
  declare returnDate?: Date;

  @ApiProperty({
    example: '2026-01-29T15:00:00.000Z',
    description: 'Fecha real en que se devolvió el ejemplar',
    required: false,
  })
  declare returnDateReal?: Date;

  @ApiProperty({
    example: LoanStatus.Activo,
    description: 'Estado actual del préstamo',
    required: false,
    enum: LoanStatus,
  })
  declare status?: LoanStatus;
}
