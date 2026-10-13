import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Fine } from '../../../requests/fine/entities/fine.entity.js';

export class SuspensionResponse {
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
    description: 'Identificador de la multa que originó la suspensión',
    required: false,
    nullable: true,
  })
  fineId?: number | null;

  @ApiProperty({
    example: 'Acumulación de 3 multas impagas',
    description: 'Motivo de la suspensión',
  })
  reason!: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de inicio de la suspensión',
  })
  startDate!: Date;

  @ApiProperty({
    example: '2026-02-15T10:30:00.000Z',
    description: 'Fecha de finalización de la suspensión',
    required: false,
    nullable: true,
  })
  endDate?: Date | null;

  @ApiProperty({
    example: 'Activa',
    description: 'Estado de la suspensión',
  })
  status!: string;

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

export class PaginatedSuspensionsResponse {
  @ApiProperty({
    description: 'Listado de suspensiones de la página actual',
  })
  data!: SuspensionResponse[];

  @ApiProperty({ example: 2, description: 'Número total de suspensiones' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 1, description: 'Número total de páginas' })
  totalPages!: number;
}

export class SuspensionDeleteResponse {
  @ApiProperty({
    example: 'Suspensión eliminada correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class SuspensionErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró la suspensión',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
