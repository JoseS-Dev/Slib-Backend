import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createFineSchema } from '../../../../shared/dtos/index.js';

export class CreateFineDto extends createZodDto(createFineSchema) {
  @ApiProperty({
    example: 12,
    description: 'Identificador del préstamo vencido',
  })
  declare loanId: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario sancionado',
  })
  declare userId: number;

  @ApiProperty({
    example: 25.5,
    description: 'Monto de la multa',
  })
  declare amount: number;

  @ApiProperty({
    example: 'Retraso en la devolución del libro',
    description: 'Razón o motivo de la multa',
    required: false,
    maxLength: 255,
  })
  declare reason?: string;
}
