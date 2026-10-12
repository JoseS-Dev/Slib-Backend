import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: 7, description: 'Identificador único del usuario' })
  id!: number;

  @ApiProperty({ example: 1, description: 'Identificador del rol del usuario' })
  roleId!: number;

  @ApiProperty({ example: 'Juan', description: 'Nombre(s) del usuario' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido(s) del usuario' })
  lastName!: string;

  @ApiProperty({
    example: 'juanperez',
    description: 'Nombre de usuario único',
  })
  userName!: string;

  @ApiProperty({
    example: 'juan.perez@slib.com',
    description: 'Correo electrónico del usuario',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    example: '+584141234567',
    description: 'Número de teléfono del usuario',
    required: false,
    nullable: true,
  })
  phoneNumber?: string | null;

  @ApiProperty({
    example: 0,
    description: 'Número de intentos fallidos de inicio de sesión',
  })
  failedLoginAttempts!: number;

  @ApiProperty({
    example: true,
    description: 'Indica si la cuenta está activa',
  })
  isActive!: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario verificó su correo',
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
}

export class PaginatedUsersResponse {
  @ApiProperty({
    type: [UserResponse],
    description: 'Listado de usuarios de la página actual',
  })
  data!: UserResponse[];

  @ApiProperty({ example: 18, description: 'Número total de usuarios activos' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 2, description: 'Número total de páginas' })
  totalPages!: number;
}

export class UserDeleteResponse {
  @ApiProperty({
    example: 'Usuario eliminado correctamente',
    description: 'Mensaje de confirmación de la eliminación lógica',
  })
  message!: string;
}

export class UserErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'Ya existe un usuario con el mismo correo o nombre de usuario',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Conflict',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
