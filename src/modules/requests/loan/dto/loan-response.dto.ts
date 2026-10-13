import { ApiProperty } from '@nestjs/swagger';
import { Loan } from '../entities/loan.entity.js';
import { Item } from '../../items/entities/item.entity.js';
import { Physical } from '../../../books/physical/entities/physical.entity.js';

export class LoanResponse {
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
    description: 'Identificador del recepcionista',
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
    description: 'Fecha real de devolución',
    required: false,
    nullable: true,
  })
  returnDateReal?: Date | null;

  @ApiProperty({
    example: 'Activo',
    description: 'Estado actual del préstamo',
  })
  status!: string;

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
    description:
      'Datos del item de solicitud y del ejemplar físico (opcional, presente en includes)',
    required: false,
  })
  item?: Item | null;

  @ApiProperty({
    description:
      'Datos del ejemplar físico y del item de solicitud (opcional, presente en includes)',
      required: false,
  })
  physicalCopy?: Physical | null;
}

export class PaginatedLoansResponse {
  @ApiProperty({
    description: 'Listado de préstamos de la página actual',
  })
  data!: LoanResponse[];

  @ApiProperty({
    example: 80,
    description: 'Número total de préstamos',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 8, description: 'Número total de páginas' })
  totalPages!: number;
}

export class LoanDeleteResponse {
  @ApiProperty({
    example: 'Préstamo eliminado correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class LoanErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Parámetros de paginación invalidos',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
