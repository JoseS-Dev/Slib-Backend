import { ApiProperty } from '@nestjs/swagger';
import { IncidentType } from '../../../../../generated/prisma/enums.js';

export class ChangeIncidentStatusDto {
  @ApiProperty({
    example: 'En_Revision',
    description: 'Nuevo estado del incidente',
    enum: IncidentType,
  })
  newStatus!: IncidentType;
}
