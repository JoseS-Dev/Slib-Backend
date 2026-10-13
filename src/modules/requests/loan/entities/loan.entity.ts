import { ApiProperty } from '@nestjs/swagger';
import { LoanStatus } from '../../../../../generated/prisma/enums.js';
import { Item } from '../../items/entities/item.entity.js';
import { Physical } from '../../../books/physical/entities/physical.entity.js';

export class Loan {
  @ApiProperty({ example: 1, description: 'Identificador único del préstamo' })
  id!: number;

  @ApiProperty({
    example: 12,
    description: 'Identificador del item de solicitud asociado',
  })
  requestItemId!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del ejemplar físico prestado',
  })
  physicalCopyId!: number;

  @ApiProperty({
    example: 3,
    description: 'Identificador del recepcionista que gestionó el préstamo',
  })
  recepcionistId!: number;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha en que se realizó el préstamo',
  })
  loanDate!: Date;

  @ApiProperty({
    example: '2026-01-30T10:30:00.000Z',
    description: 'Fecha pactada para la devolución',
    required: false,
    nullable: true,
  })
  returnDate?: Date | null;

  @ApiProperty({
    example: '2026-01-29T15:00:00.000Z',
    description: 'Fecha real en que se devolvió el ejemplar',
    required: false,
    nullable: true,
  })
  returnDateReal?: Date | null;

  @ApiProperty({
    example: LoanStatus.Activo,
    description: 'Estado actual del préstamo',
    enum: LoanStatus,
  })
  status!: LoanStatus;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del registro',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del registro',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación lógica',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiProperty({
    description: 'Datos del item de solicitud (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  item?: Item | null;

  @ApiProperty({
    description: 'Datos del ejemplar físico prestado (opcional)',
    required: false,
    nullable: true,
  })
  physicalCopy?: Physical | null;
}
