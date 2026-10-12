import { ApiProperty } from '@nestjs/swagger';
import type { SessionPayload } from '../sessions.constants.js';

export class LoginSessionData {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la sesión recién creada',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario autenticado',
  })
  userId!: number;

  @ApiProperty({
    example: true,
    description: 'Indica que la nueva sesión está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la sesión',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la sesión',
  })
  updatedAt!: Date;
}

export class LoginResponse {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la sesión recién creada',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario autenticado',
  })
  userId!: number;

  @ApiProperty({
    example: true,
    description: 'Indica que la nueva sesión está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la sesión',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la sesión',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Token JWT de acceso. Inclúyelo en las cabeceras Authorization: Bearer <token>',
  })
  accessToken!: string;
}

export class RefreshTokenResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Nuevo token JWT de acceso',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Nuevo token JWT de refresco (también enviado en cookie httpOnly)',
  })
  refreshToken!: string;
}

export class LogoutResponse {
  @ApiProperty({
    example: 'Sesión cerrada correctamente',
    description: 'Mensaje de confirmación del cierre de sesión',
  })
  message!: string;
}

export class VerifySessionUserPayload implements SessionPayload {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario extraído del JWT',
  })
  sub!: number;

  @ApiProperty({
    example: 'usuario@slib.com',
    description: 'Correo del usuario extraído del JWT',
  })
  email!: string;

  @ApiProperty({
    example: 'Usuario',
    description: 'Rol del usuario extraído del JWT',
  })
  role!: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Identificador único del token JWT (jti)',
  })
  jti!: string;
}

export class VerifySessionResponse {
  @ApiProperty({
    example: 'Sesión válida',
    description: 'Mensaje de confirmación de la sesión',
  })
  message!: string;

  @ApiProperty({
    example: true,
    description: 'Indica que el usuario está autenticado',
  })
  isAuthenticated!: boolean;

  @ApiProperty({
    type: () => VerifySessionUserPayload,
    description: 'Datos del usuario extraídos del token JWT',
  })
  user!: VerifySessionUserPayload;
}

export class AuthErrorResponse {
  @ApiProperty({ example: 401, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Credenciales inválidas',
    description: 'Mensaje descriptivo del error de autenticación',
  })
  message!: string;

  @ApiProperty({
    example: 'Unauthorized',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}

export class ForbiddenAuthResponse {
  @ApiProperty({ example: 403, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example:
      'Contraseña incorrecta. Le quedan 3 intentos antes de que su cuenta sea bloqueada.',
    description:
      'Mensaje de error (contraseña incorrecta, usuario bloqueado o no verificado)',
  })
  message!: string;

  @ApiProperty({
    example: 'Forbidden',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
