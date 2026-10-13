import { ApiProperty } from '@nestjs/swagger';
import { Request } from '../entities/request.entity.js';
import { Item } from '../../items/entities/item.entity.js';
import { User } from '../../../auth/users/entities/user.entity.js';

export class RequestResponse {
  @ApiProperty({ example: 1, description: 'Identificador único de la solicitud' })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que creó la solicitud',
  })
  userId!: number;

  @ApiProperty({
    example: 'Solicitud de libro de matemáticas',
    description: 'Título de la solicitud',
  })
  titleRequest!: string;

  @ApiProperty({
    example: 'Necesito el libro para el primer parcial de cálculo',
    description: 'Descripción de la solicitud',
    required: false,
    nullable: true,
  })
  descriptionRequest?: string | null;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha en que se creó la solicitud',
  })
  requestDate!: Date;

  @ApiProperty({
    example: 'Cambio de fecha del parcial',
    description: 'Razón de cancelación',
    required: false,
    nullable: true,
  })
  reasonCancellation?: string | null;

  @ApiProperty({
    example: 'En_Revision',
    description: 'Estado actual de la solicitud',
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
    example: null,
    description: 'Fecha de eliminación lógica',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiProperty({
    description: 'Datos del usuario y los items (opcional, presente en includes)',
    required: false,
  })
  user?: User | null;

  @ApiProperty({
    description: 'Lista de items (ejemplares) asociados a la solicitud',
    required: false,
  })
  items?: Item[] | null;
}

export class PaginatedRequestsResponse {
  @ApiProperty({
    description: 'Listado de solicitudes de la página actual',
  })
  data!: RequestResponse[];

  @ApiProperty({
    example: 120,
    description: 'Número total de solicitudes',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 12, description: 'Número total de páginas' })
  totalPages!: number;
}

export class RequestDeleteResponse {
  @ApiProperty({
    example: 'Solicitud eliminada correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class RequestErrorResponse {
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
