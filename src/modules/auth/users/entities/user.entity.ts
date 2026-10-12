import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 7, description: 'Identificador único del usuario' })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'Identificador del rol asignado al usuario',
  })
  roleId!: number;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre(s) del usuario',
    maxLength: 50,
  })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido(s) del usuario',
    maxLength: 50,
  })
  lastName!: string;

  @ApiProperty({
    example: 'juanperez',
    description: 'Nombre de usuario único en el sistema',
    maxLength: 50,
  })
  userName!: string;

  @ApiProperty({
    example: 'juan.perez@slib.com',
    description: 'Correo electrónico único del usuario',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    example: '+584141234567',
    description: 'Número de teléfono del usuario (opcional)',
    required: false,
    nullable: true,
    maxLength: 11,
  })
  phoneNumber?: string | null;

  @ApiProperty({
    example: 0,
    description: 'Número de intentos fallidos de inicio de sesión',
  })
  failedLoginAttempts!: number;

  @ApiProperty({
    example: true,
    description: 'Indica si la cuenta del usuario está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario ha verificado su correo electrónico',
  })
  verified!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación del usuario',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización del usuario',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description:
      'Fecha de eliminación lógica (soft delete). null si el usuario está activo',
    required: false,
    nullable: true,
  })
  deletedAt?: Date | null;
}
