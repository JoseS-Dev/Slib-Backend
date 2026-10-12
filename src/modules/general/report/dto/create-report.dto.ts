import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createReportSchema } from '../../../../shared/index.js';
import { ReportType } from '../../../../../generated/prisma/enums.js';

export class CreateReportDto extends createZodDto(createReportSchema) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que genera el reporte',
  })
  declare userId: number;

  @ApiProperty({
    example: 'Préstamos activos del mes',
    description: 'Nombre del reporte',
    minLength: 1,
    maxLength: 100,
  })
  declare name: string;

  @ApiProperty({
    example: 'Listado de préstamos activos durante el mes de enero',
    description: 'Descripción opcional del reporte',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  declare description?: string;

  @ApiProperty({
    example: 'Prestamo',
    description: 'Tipo de reporte',
    enum: ReportType,
  })
  declare typeReport: ReportType;
}
