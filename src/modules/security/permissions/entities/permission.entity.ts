import { ApiProperty } from '@nestjs/swagger';

export class Permission {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del permiso',
  })
  id!: number;

  @ApiProperty({
    example: 'Crear usuarios',
    description: 'Nombre único del permiso en el sistema',
    maxLength: 20,
  })
  name!: string;

  @ApiProperty({
    example: 'Permite crear nuevos usuarios en el sistema',
    description: 'Descripción opcional del propósito del permiso',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del permiso',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del permiso',
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
}
