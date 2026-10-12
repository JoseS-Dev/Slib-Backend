import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateReportSchema } from '../../../../shared/index.js';
import { ReportType } from '../../../../../generated/prisma/enums.js';

export class UpdateReportDto extends createZodDto(updateReportSchema) {
  @ApiProperty({
    example: 'Préstamos activos del mes',
    description: 'Nombre del reporte',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  declare name?: string;

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
    required: false,
  })
  declare typeReport?: ReportType;

  @ApiProperty({
    example: true,
    description: 'Indica si el reporte está activo',
    required: false,
  })
  declare isActive?: boolean;
}
