import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createRoleDto } from '../../../../shared/index.js';

export class CreateRoleDto extends createZodDto(createRoleDto) {
  @ApiProperty({
    example: 'Bibliotecario',
    description: 'Nombre único del rol',
    minLength: 1,
    maxLength: 20,
  })
  declare name: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el rol será el rol por defecto del sistema',
    required: false,
    default: false,
  })
  declare isDefault?: boolean;

  @ApiProperty({
    example: [1, 2, 5],
    description:
      'Identificadores de los permisos que se asociarán al rol al crearlo',
    required: false,
  })
  declare permissionsIds?: number[];
}
