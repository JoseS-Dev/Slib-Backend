import { ApiProperty } from '@nestjs/swagger';
import { IncidentType } from '../../../../../generated/prisma/enums.js';
import { User } from '../../../auth/users/entities/user.entity.js';
import { Physical } from '../../../books/physical/entities/physical.entity.js';
import { Loan } from '../../../requests/loan/entities/loan.entity.js';

export class Incident {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del incidente',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario que reporta el incidente',
  })
  userId!: number;

  @ApiProperty({
    example: 14,
    description: 'Identificador del ejemplar físico relacionado (opcional)',
    required: false,
    nullable: true,
  })
  physicalCopyId?: number | null;

  @ApiProperty({
    example: 3,
    description: 'Identificador del préstamo relacionado (opcional)',
    required: false,
    nullable: true,
  })
  loanId?: number | null;

  @ApiProperty({
    example: 'Libro dañado en la portada',
    description: 'Título del incidente',
    maxLength: 100,
  })
  title!: string;

  @ApiProperty({
    example:
      'El libro "Cien años de soledad" presenta daños en la portada y varias páginas rasgadas.',
    description: 'Descripción detallada del incidente',
    maxLength: 500,
  })
  description!: string;

  @ApiProperty({
    example: 'Daño de libro',
    description: 'Tipo/categoría del incidente',
  })
  typeIncident!: string;

  @ApiProperty({
    example: 'Se está evaluando el caso con el equipo de mantenimiento.',
    description: 'Mensaje o comentario del administrador (opcional)',
    required: false,
    nullable: true,
    maxLength: 500,
  })
  messageAdmin?: string | null;

  @ApiProperty({
    example: 'En_Revision',
    description: 'Estado actual del incidente',
    enum: IncidentType,
  })
  status!: IncidentType;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del incidente',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del incidente',
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
    description:
      'Datos del usuario que reportó (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    type: () => Physical,
    description:
      'Datos del ejemplar físico relacionado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  physical?: Physical | null;

  @ApiProperty({
    type: () => Loan,
    description:
      'Datos del préstamo relacionado (opcional, presente en includes)',
    required: false,
    nullable: true,
  })
  loan?: Loan | null;
}
