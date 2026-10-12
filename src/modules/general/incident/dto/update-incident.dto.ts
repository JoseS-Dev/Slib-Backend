import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateIncidentSchema } from '../../../../shared/index.js';
import { IncidentType } from '../../../../../generated/prisma/enums.js';

export class UpdateIncidentDto extends createZodDto(updateIncidentSchema) {
  @ApiProperty({
    example: 'Libro dañado en la portada',
    description: 'Título del incidente',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  declare title?: string;

  @ApiProperty({
    example: 'Descripción actualizada del incidente',
    description: 'Descripción detallada del incidente',
    minLength: 1,
    maxLength: 500,
    required: false,
  })
  declare description?: string;

  @ApiProperty({
    example: 'Daño de libro',
    description: 'Tipo o categoría del incidente',
    required: false,
  })
  declare typeIncident?: string;

  @ApiProperty({
    example: 'Se está evaluando el caso con el equipo de mantenimiento.',
    description: 'Mensaje o comentario del administrador',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  declare messageAdmin?: string;

  @ApiProperty({
    example: 'En_Revision',
    description: 'Estado actual del incidente',
    enum: IncidentType,
    required: false,
  })
  declare status?: IncidentType;
}
