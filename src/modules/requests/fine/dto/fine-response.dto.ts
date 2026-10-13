import { ApiProperty } from '@nestjs/swagger';
import { Fine } from '../entities/fine.entity.js';

export class FineResponse {
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
    example: 25.5,
    description: 'Monto de la multa',
  })
  amount!: number;

  @ApiProperty({
    example: 'Retraso en la devolución del libro',
    description: 'Razón o motivo de la multa',
    required: false,
    nullable: true,
  })
  reason?: string | null;

  @ApiProperty({
    example: 'Pendiente',
    description: 'Estado actual de la multa',
  })
  status!: string;

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
    type: () => Fine,
    description: 'Datos del préstamo asociado (opcional, presente en includes)',
    required: false,
  })
  loan?: Fine;
}

export class PaginatedFinesResponse {
  @ApiProperty({
    type: [FineResponse],
    description: 'Listado de multas de la página actual',
  })
  data!: FineResponse[];

  @ApiProperty({
    example: 45,
    description: 'Número total de multas',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Número total de páginas' })
  totalPages!: number;
}

export class FineDeleteResponse {
  @ApiProperty({
    example: 'Multa eliminada correctamente.',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class FineErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Los parámetros de paginación son inválidos.',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
