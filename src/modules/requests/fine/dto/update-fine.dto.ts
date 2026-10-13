import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { FineStatus } from '../../../../../generated/prisma/enums.js';
import { updateFineSchema } from '../../../../shared/dtos/index.js';

export class UpdateFineDto extends createZodDto(updateFineSchema) {
  @ApiProperty({
    example: 25.5,
    description: 'Monto de la multa',
    required: false,
  })
  declare amount?: number;

  @ApiProperty({
    example: 'Retraso en la devolución del libro',
    description: 'Razón o motivo de la multa',
    required: false,
    maxLength: 255,
  })
  declare reason?: string;

  @ApiProperty({
    example: FineStatus.Pendiente,
    description: 'Estado actual de la multa',
    required: false,
    enum: FineStatus,
  })
  declare status?: FineStatus;
}
