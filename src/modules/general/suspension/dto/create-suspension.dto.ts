import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createSuspensionSchema } from '../../../../shared/dtos/index.js';

export class CreateSuspensionDto extends createZodDto(createSuspensionSchema) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario a suspender',
  })
  declare userId: number;

  @ApiProperty({
    example: 3,
    description:
      'Identificador de la multa que origina la suspensión (opcional)',
    required: false,
    nullable: true,
  })
  declare fineId?: number;

  @ApiProperty({
    example: 'Acumulación de 3 multas impagas en los últimos 6 meses',
    description: 'Motivo de la suspensión',
    minLength: 1,
    maxLength: 255,
  })
  declare reason: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de inicio de la suspensión',
    format: 'date-time',
  })
  declare startDate: Date;

  @ApiProperty({
    example: '2026-02-15T10:30:00.000Z',
    description: 'Fecha de finalización de la suspensión (opcional)',
    required: false,
    nullable: true,
    format: 'date-time',
  })
  declare endDate?: Date;
}
