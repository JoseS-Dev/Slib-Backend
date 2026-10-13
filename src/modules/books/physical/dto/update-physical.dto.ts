import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { PhysicalCopyStatus } from '../../../../../generated/prisma/enums.js';
import { updatePhysicalCopySchema } from '../../../../shared/index.js';

export class UpdatePhysicalDto extends createZodDto(updatePhysicalCopySchema) {
  @ApiProperty({
    example: 'CP-001',
    description: 'Número de copia del ejemplar',
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  declare copyNumber?: string;

  @ApiProperty({
    example: 'Estantería A-3',
    description: 'Ubicación física del ejemplar',
    required: false,
    maxLength: 100,
  })
  declare ubication?: string;

  @ApiProperty({
    example: PhysicalCopyStatus.Disponible,
    description: 'Estado actual del ejemplar',
    required: false,
    enum: PhysicalCopyStatus,
  })
  declare status?: PhysicalCopyStatus;
}
