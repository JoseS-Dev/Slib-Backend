import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { loginUserDto } from '../../../../shared/index.js';

export class CreateSessionDto extends createZodDto(loginUserDto) {
  @ApiProperty({
    example: 'usuario@slib.com',
    description: 'Correo electrónico registrado del usuario',
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
}
