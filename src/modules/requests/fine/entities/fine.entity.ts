import { ApiProperty } from '@nestjs/swagger';
import { FineStatus } from '../../../../../generated/prisma/enums.js';
import { Decimal } from '../../../../../generated/prisma/internal/prismaNamespace.js';
import { Loan } from '../../loan/entities/loan.entity.js';

export class Fine {
  @ApiProperty({ example: 1, description: 'Identificador único de la multa' })
  id!: number;

  @ApiProperty({
    example: 12,
    description: 'Identificador del préstamo que originó la multa',
  })
  loanId!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario sancionado',
  })
  userId!: number;

  @ApiProperty({
    example: '25.50',
    description: 'Monto de la multa',
  })
  amount!: Decimal;

  @ApiProperty({
    example: 'Retraso en la devolución del libro',
    description: 'Razón o motivo de la multa',
    required: false,
    nullable: true,
  })
  reason?: string | null;

  @ApiProperty({
    example: FineStatus.Pendiente,
    description: 'Estado actual de la multa',
    enum: FineStatus,
  })
  status!: FineStatus;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la multa',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la multa',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: () => Loan,
    description: 'Datos del préstamo asociado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  loan?: Loan | null;
}
