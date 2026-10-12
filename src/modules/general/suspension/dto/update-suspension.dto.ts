import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateSuspensionSchema } from '../../../../shared/dtos/index.js';
import { SuspensionStatus } from '../../../../../generated/prisma/enums.js';

export class UpdateSuspensionDto extends createZodDto(updateSuspensionSchema) {
  @ApiProperty({
    example: 'Motivo actualizado de la suspensión',
    description: 'Motivo de la suspensión',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  declare reason?: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de inicio de la suspensión',
    required: false,
    format: 'date-time',
  })
  declare startDate?: Date;

  @ApiProperty({
    example: '2026-02-15T10:30:00.000Z',
    description: 'Fecha de finalización de la suspensión',
    required: false,
    nullable: true,
    format: 'date-time',
  })
  declare endDate?: Date;

  @ApiProperty({
    example: 'Revocada',
    description: 'Estado de la suspensión',
    enum: SuspensionStatus,
    required: false,
  })
  declare status?: SuspensionStatus;
}
