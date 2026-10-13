import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../entities/item.entity.js';
import { Request } from '../../request/entities/request.entity.js';
import { Physical } from '../../../books/physical/entities/physical.entity.js';

export class ItemResponse {
  @ApiProperty({ example: 1, description: 'Identificador único del item' })
  id!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador de la solicitud a la que pertenece el item',
  })
  requestId!: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del ejemplar físico asociado',
  })
  physicalCopyId!: number;

  @ApiProperty({
    example: 'Pendiente',
    description: 'Estado actual del item',
  })
  status!: string;

  @ApiProperty({
    description:
      'Datos de la solicitud y del ejemplar físico (opcional, presente en includes)',
    required: false,
  })
  request?: Request | null;

  @ApiProperty({
    description:
      'Datos del ejemplar físico y de la solicitud (opcional, presente en includes)',
    required: false,
  })
  physical?: Physical | null;
}

export class PaginatedItemsResponse {
  @ApiProperty({
    description: 'Listado de items de la página actual',
  })
  data!: ItemResponse[];

  @ApiProperty({
    example: 12,
    description: 'Número total de items',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 2, description: 'Número total de páginas' })
  totalPages!: number;
}

export class ItemDeleteResponse {
  @ApiProperty({
    example: 'Item eliminado correctamente.',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class ItemErrorResponse {
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
