import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createUserDto, createUserAdminDto } from '../../../../shared/index.js';

export class CreateUserDto extends createZodDto(createUserDto) {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre(s) del usuario',
    minLength: 1,
    maxLength: 50,
  })
  declare firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido(s) del usuario',
    minLength: 1,
    maxLength: 50,
  })
  declare lastName: string;

  @ApiProperty({
    example: 'juanperez',
    description: 'Nombre de usuario único en el sistema',
    minLength: 1,
    maxLength: 50,
  })
  declare userName: string;

  @ApiProperty({
    example: 'juan.perez@slib.com',
    description: 'Correo electrónico único del usuario',
    format: 'email',
  })
  declare email: string;

  @ApiProperty({
    example: 'secreto1',
    description: 'Contraseña del usuario (entre 6 y 8 caracteres)',
    minLength: 6,
    maxLength: 8,
    format: 'password',
  })
  declare password: string;

  @ApiProperty({
    example: '+584141234567',
    description: 'Número de teléfono del usuario (opcional)',
    required: false,
    nullable: true,
    maxLength: 11,
  })
  declare phoneNumber?: string;
}

export class CreateAdminUserDto extends createZodDto(createUserAdminDto) {
  @ApiProperty({
    example: 2,
    description: 'Identificador del rol que se asignará al nuevo usuario',
  })
  declare roleId: number;

  @ApiProperty({
    example: 'María',
    description: 'Nombre(s) del usuario',
    minLength: 1,
    maxLength: 50,
  })
  declare firstName: string;

  @ApiProperty({
    example: 'Gómez',
    description: 'Apellido(s) del usuario',
    minLength: 1,
    maxLength: 50,
  })
  declare lastName: string;

  @ApiProperty({
    example: 'mariag',
    description: 'Nombre de usuario único en el sistema',
    minLength: 1,
    maxLength: 50,
  })
  declare userName: string;

  @ApiProperty({
    example: 'maria.gomez@slib.com',
    description: 'Correo electrónico único del usuario',
    format: 'email',
  })
  declare email: string;

  @ApiProperty({
    example: '+584149876543',
    description: 'Número de teléfono del usuario (opcional)',
    required: false,
    nullable: true,
    maxLength: 11,
  })
  declare phoneNumber?: string;
}
