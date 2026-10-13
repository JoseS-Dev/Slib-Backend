import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createLoanSchema } from '../../../../shared/dtos/requests/loan/loan.dtos.js';

export class CreateLoanDto extends createZodDto(createLoanSchema) {
  @ApiProperty({
    example: 12,
    description: 'Identificador del item de solicitud asociado',
  })
  declare requestItemId: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del ejemplar físico prestado',
  })
  declare physicalCopyId: number;

  @ApiProperty({
    example: 3,
    description: 'Identificador del recepcionista que gestiona el préstamo',
  })
  declare recepcionistId: number;

  @ApiProperty({
    example: '2026-01-30T10:30:00.000Z',
    description: 'Fecha pactada para la devolución',
    required: false,
  })
  declare returnDate?: Date;
}
