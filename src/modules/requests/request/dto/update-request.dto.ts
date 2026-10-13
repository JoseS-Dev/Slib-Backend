import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { RequestStatus } from '../../../../../generated/prisma/enums.js';
import { updateRequestSchema } from '../../../../shared/index.js';

export class UpdateRequestDto extends createZodDto(updateRequestSchema) {
  @ApiProperty({
    example: 'Solicitud de libro de matemáticas (actualizada)',
    description: 'Título de la solicitud',
    required: false,
    maxLength: 100,
  })
  declare titleRequest?: string;

  @ApiProperty({
    example: 'Necesito el libro actualizado para el segundo parcial',
    description: 'Descripción de la solicitud',
    required: false,
    maxLength: 500,
  })
  declare descriptionRequest?: string;

  @ApiProperty({
    example: '2026-01-20T10:30:00.000Z',
    description: 'Fecha de la solicitud',
    required: false,
  })
  declare requestDate?: Date;

  @ApiProperty({
    example: 'Cambio de fecha del parcial',
    description:
      'Razón de cancelación (obligatoria cuando el estado es Cancelada)',
    required: false,
    maxLength: 500,
  })
  declare reasonCancellation?: string;

  @ApiProperty({
    example: RequestStatus.Aprobada,
    description: 'Estado de la solicitud',
    required: false,
    enum: RequestStatus,
  })
  declare status?: RequestStatus;

  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description: 'Lista de items a agregar a la solicitud',
    required: false,
  })
  declare items?: { physicalCopyId: number }[];
}
