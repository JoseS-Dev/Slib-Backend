import { ApiProperty } from '@nestjs/swagger';
import { SuspensionStatus } from '../../../../../generated/prisma/enums.js';

export class ChangeSuspensionStatusDto {
  @ApiProperty({
    example: 'Revocada',
    description: 'Nuevo estado de la suspensión',
    enum: SuspensionStatus,
  })
  newStatus!: SuspensionStatus;
}
