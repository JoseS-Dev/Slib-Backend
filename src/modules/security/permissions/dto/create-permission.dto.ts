import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createPermissionDto } from '../../../../shared/index.js';

export class CreatePermissionDto extends createZodDto(createPermissionDto) {
  @ApiProperty({
    example: 'Crear usuarios',
    description: 'Nombre único del permiso',
    minLength: 1,
    maxLength: 20,
  })
  declare name: string;

  @ApiProperty({
    example: 'Permite crear nuevos usuarios en el sistema',
    description: 'Descripción opcional del propósito del permiso',
    required: false,
    nullable: true,
  })
  declare description?: string;
}
