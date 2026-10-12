import { ApiProperty } from '@nestjs/swagger';
import { ReportType } from '../../../../../generated/prisma/enums.js';
import { User } from '../../../auth/users/entities/user.entity.js';

export class Report {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del reporte',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que generó el reporte',
  })
  userId!: number;

  @ApiProperty({
    example: 'Préstamos activos del mes',
    description: 'Nombre del reporte',
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    example: 'Listado de préstamos activos durante el mes de enero',
    description: 'Descripción opcional del reporte',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  description?: string | null;

  @ApiProperty({
    example: 'Prestamo',
    description: 'Tipo de reporte',
    enum: ReportType,
  })
  typeReport!: ReportType;

  @ApiProperty({
    example: true,
    description: 'Indica si el reporte está activo',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del reporte',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del reporte',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description:
      'Fecha de eliminación lógica (soft delete). null si está activo',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;

  @ApiProperty({
    type: () => User,
    description: 'Datos del usuario que generó el reporte (opcional)',
    required: false,
    nullable: true,
  })
  user?: User;
}
