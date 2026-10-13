import { ApiProperty } from '@nestjs/swagger';
import { SuspensionStatus } from '../../../../../generated/prisma/enums.js';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Fine } from '../../../requests/fine/entities/fine.entity.js';

export class Suspension {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la suspensión',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario suspendido',
  })
  userId!: number;

  @ApiProperty({
    example: 3,
    description:
      'Identificador de la multa que originó la suspensión (opcional)',
    required: false,
    nullable: true,
  })
  fineId?: number | null;

  @ApiProperty({
    example: 'Acumulación de 3 multas impagas en los últimos 6 meses',
    description: 'Motivo de la suspensión',
    maxLength: 255,
  })
  reason!: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de inicio de la suspensión',
  })
  startDate!: Date;

  @ApiProperty({
    example: '2026-02-15T10:30:00.000Z',
    description: 'Fecha de finalización de la suspensión (opcional)',
    required: false,
    nullable: true,
  })
  endDate?: Date | null;

  @ApiProperty({
    example: 'Activa',
    description: 'Estado actual de la suspensión',
    enum: SuspensionStatus,
  })
  status!: SuspensionStatus;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la suspensión',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la suspensión',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description:
      'Fecha de eliminación lógica (soft delete). null si está activa',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiProperty({
    description: 'Datos del usuario suspendido (opcional)',
    required: false,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    description: 'Datos de la multa relacionada (opcional)',
    required: false,
    nullable: true,
  })
  fine?: Fine | null;
}
