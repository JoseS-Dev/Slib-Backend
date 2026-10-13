import { ApiProperty } from '@nestjs/swagger';
import { Request } from '../../request/entities/request.entity.js';
import { RequestItemStatus } from '../../../../../generated/prisma/enums.js';
import { Physical } from '../../../books/physical/entities/physical.entity.js';

export class Item {
  @ApiProperty({ example: 1, description: 'Identificador único del item' })
  id!: number;

  @ApiProperty({
    example: 4,
    description: 'Identificador de la solicitud a la que pertenece el item',
  })
  requestId!: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del ejemplar físico asociado al item',
  })
  physicalCopyId!: number;

  @ApiProperty({
    example: RequestItemStatus.Pendiente,
    description: 'Estado actual del item',
    enum: RequestItemStatus,
  })
  status!: RequestItemStatus;

  @ApiProperty({
    description: 'Datos de la solicitud asociada (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  request?: Request | null;

  @ApiProperty({
    description: 'Datos del ejemplar físico asociado (opcional)',
    required: false,
    nullable: true,
  })
  physical?: Physical | null;
}
