import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updatePermissionDto } from '../../../../shared/index.js';

export class UpdatePermissionDto extends createZodDto(updatePermissionDto) {
  @ApiProperty({
    example: 'Editar usuarios',
    description: 'Nombre único del permiso (opcional en actualización)',
    minLength: 1,
    maxLength: 20,
    required: false,
  })
  declare name?: string;

  @ApiProperty({
    example: 'Permite editar usuarios existentes',
    description: 'Descripción opcional del propósito del permiso',
    required: false,
    nullable: true,
  })
  declare description?: string;
}
