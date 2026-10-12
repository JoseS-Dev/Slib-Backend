import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createIncidentSchema } from '../../../../shared/index.js';

export class CreateIncidentDto extends createZodDto(createIncidentSchema) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que reporta el incidente',
  })
  declare userId: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del ejemplar físico relacionado (opcional)',
    required: false,
    nullable: true,
  })
  declare physicalCopyId?: number;

  @ApiProperty({
    example: 3,
    description: 'Identificador del préstamo relacionado (opcional)',
    required: false,
    nullable: true,
  })
  declare loanId?: number;

  @ApiProperty({
    example: 'Libro dañado en la portada',
    description: 'Título del incidente',
    minLength: 1,
    maxLength: 100,
  })
  declare title: string;

  @ApiProperty({
    example:
      'El libro "Cien años de soledad" presenta daños en la portada y varias páginas rasgadas.',
    description: 'Descripción detallada del incidente',
    minLength: 1,
    maxLength: 500,
  })
  declare description: string;

  @ApiProperty({
    example: 'Daño de libro',
    description: 'Tipo o categoría del incidente',
  })
  declare typeIncident: string;
}
