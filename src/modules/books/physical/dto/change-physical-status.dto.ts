import { ApiProperty } from '@nestjs/swagger';
import { PhysicalCopyStatus } from '../../../../../generated/prisma/enums.js';

export class ChangePhysicalStatusDto {
  @ApiProperty({
    example: PhysicalCopyStatus.Prestado,
    description: 'Nuevo estado del ejemplar físico',
    enum: PhysicalCopyStatus,
  })
  newStatus!: PhysicalCopyStatus;
}
