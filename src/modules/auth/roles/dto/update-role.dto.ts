import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateRoleDto } from '../../../../shared/index.js';

export class UpdateRoleDto extends createZodDto(updateRoleDto) {
  @ApiProperty({
    example: 'Bibliotecario Senior',
    description: 'Nombre único del rol',
    minLength: 1,
    maxLength: 20,
    required: false,
  })
  declare name?: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el rol será el rol por defecto del sistema',
    required: false,
  })
  declare isDefault?: boolean;

  @ApiProperty({
    example: [1, 2, 3],
    description:
      'Identificadores de los permisos. Si se envía, reemplaza la lista completa de permisos del rol',
    required: false,
  })
  declare permissionsIds?: number[];
}
