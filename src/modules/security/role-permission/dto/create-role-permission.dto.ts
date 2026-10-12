import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createRolePermissionDto } from '../../../../shared/index.js';

export class CreateRolePermissionDto extends createZodDto(
  createRolePermissionDto,
) {
  @ApiProperty({
    example: 1,
    description: 'Identificador del rol al que se asocia el permiso',
  })
  declare roleId: number;

  @ApiProperty({
    example: 5,
    description: 'Identificador del permiso que se asocia al rol',
  })
  declare permissionId: number;
}
