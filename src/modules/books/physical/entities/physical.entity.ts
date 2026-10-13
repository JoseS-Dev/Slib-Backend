import { ApiProperty } from '@nestjs/swagger';
import { PhysicalCopyStatus } from '../../../../../generated/prisma/enums.js';
import { Book } from '../../book/entities/book.entity.js';

export class Physical {
  @ApiProperty({ example: 1, description: 'Identificador único del ejemplar' })
  id!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador del libro al que pertenece el ejemplar',
  })
  bookId!: number;

  @ApiProperty({
    example: 'CP-001',
    description: 'Número de copia del ejemplar',
  })
  copyNumber!: string;

  @ApiProperty({
    example: 'Estantería A-3',
    description: 'Ubicación física del ejemplar',
    required: false,
    nullable: true,
  })
  ubication?: string | null;

  @ApiProperty({
    example: PhysicalCopyStatus.Disponible,
    description: 'Estado actual del ejemplar',
    enum: PhysicalCopyStatus,
  })
  status!: PhysicalCopyStatus;

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
    type: () => Book,
    description: 'Datos del libro asociado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  book?: Book | null;
}
