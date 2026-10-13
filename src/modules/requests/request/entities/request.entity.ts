import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../../../../generated/prisma/enums.js';
import { User } from '../../../auth/users/entities/user.entity.js';
import { RequestItem } from '../../items/entities/item.entity.js';

export class Request {
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
    description: 'Razón de cancelación (presente si el estado es Cancelada)',
    required: false,
    nullable: true,
  })
  reasonCancellation?: string | null;

  @ApiProperty({
    example: RequestStatus.En_Revision,
    description: 'Estado actual de la solicitud',
    enum: RequestStatus,
  })
  status!: RequestStatus;

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
    description: 'Fecha de eliminación lógica (soft delete)',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiProperty({
    type: () => User,
    description: 'Datos del usuario que creó la solicitud (opcional)',
    required: false,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    type: () => [RequestItem],
    description: 'Lista de items (ejemplares) asociados a la solicitud',
    required: false,
  })
  items?: RequestItem[];
}
