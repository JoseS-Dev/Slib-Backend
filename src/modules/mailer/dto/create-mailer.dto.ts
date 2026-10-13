import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import {
  createMailerSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from '../../../shared/index.js';

export class CreateMailerDto extends createZodDto(createMailerSchema) {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del destinatario del correo',
  })
  declare firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del destinatario del correo',
  })
  declare lastName: string;

  @ApiProperty({
    example: 'juan.perez@correo.com',
    description: 'Dirección de correo electrónico del destinatario',
  })
  declare email: string;
}

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {
  @ApiProperty({
    example: 'juan.perez@correo.com',
    description:
      'Dirección de correo electrónico del usuario que restablece la contraseña',
  })
  declare email: string;

  @ApiProperty({
    example: 'NuevaClaveSegura123!',
    description: 'Nueva contraseña que el usuario desea establecer',
    minLength: 8,
  })
  declare newPassword: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description:
      'Token de verificación recibido por correo electrónico (caducidad: 1 hora)',
  })
  declare token: string;
}

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {
  @ApiProperty({
    example: 'juan.perez@correo.com',
    description:
      'Dirección de correo electrónico del usuario que solicita la recuperación',
  })
  declare email: string;
}
