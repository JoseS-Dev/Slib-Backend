import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateUserDto } from '../../../../shared/index.js';

export class UpdateUserDto extends createZodDto(updateUserDto) {
  @ApiProperty({
    example: 2,
    description: 'Identificador del nuevo rol del usuario',
    required: false,
  })
  declare roleId?: number;

  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombre(s) del usuario',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  declare firstName?: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido(s) del usuario',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  declare lastName?: string;

  @ApiProperty({
    example: 'juanperez',
    description: 'Nombre de usuario único en el sistema',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  declare userName?: string;

  @ApiProperty({
    example: 'juan.perez@slib.com',
    description: 'Correo electrónico único del usuario',
    format: 'email',
    required: false,
  })
  declare email?: string;

  @ApiProperty({
    example: 'secreto1',
    description: 'Nueva contraseña del usuario (entre 6 y 8 caracteres)',
    minLength: 6,
    maxLength: 8,
    required: false,
    format: 'password',
  })
  declare password?: string;

  @ApiProperty({
    example: '+584141234567',
    description: 'Número de teléfono del usuario',
    required: false,
    nullable: true,
    maxLength: 11,
  })
  declare phoneNumber?: string;
}
