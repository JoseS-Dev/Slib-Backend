import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { CreateUserDto, CreateAdminUserDto } from './dto/create-user.dto.js';
import { ChangeUserStatusDto } from './dto/change-user-status.dto.js';
import {
  PaginatedUsersResponse,
  UserDeleteResponse,
  UserErrorResponse,
  UserResponse,
} from './dto/user-response.dto.js';

@ApiTags('Autenticación - Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario (rol Usuario)',
    description:
      'Crea un usuario asignándole automáticamente el rol "Usuario". Se envía un correo de bienvenida. ' +
      'La contraseña se almacena hasheada con argon2.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear el usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un usuario con el mismo correo o nombre de usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el rol "Usuario" configurado en el sistema',
    type: UserErrorResponse,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @ApiBearerAuth('JWT')
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un usuario con rol personalizado',
    description:
      'Crea un usuario asignándole el rol indicado en `roleId`. Se genera una contraseña temporal aleatoria y se envía un correo para que el usuario la establezca.',
  })
  @ApiBody({ type: CreateAdminUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear el usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un usuario con el mismo correo o nombre de usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el rol especificado',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async createAdmin(
    @Body() createAdminUserDto: CreateAdminUserDto,
  ): Promise<UserResponse> {
    return this.usersService.createAdmin(createAdminUserDto);
  }

  @Get()
  @ApiBearerAuth('JWT')
  @Roles('Administrador', 'Recepcionista')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar usuarios con paginación',
    description:
      'Obtiene todos los usuarios (incluidos los inactivos) con paginación. No incluye contraseñas ni datos sensibles.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página (por defecto 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: `Cantidad de registros por página (máx. ${settings.server.maxPagination})`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de usuarios',
    type: PaginatedUsersResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAll(
    @Query(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    page: number = 1,
    @Query(
      'limit',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    limit: number = 10,
  ): Promise<PaginatedUsersResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Parámetros de paginación inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.usersService.findAll(page, limit);
  }

  @Get('active')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar usuarios activos con paginación',
    description:
      'Obtiene únicamente los usuarios activos (isActive=true) y no bloqueados (lockedUntil=null).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página (por defecto 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: `Cantidad de registros por página (máx. ${settings.server.maxPagination})`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de usuarios activos',
    type: PaginatedUsersResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByActive(
    @Query(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    page: number = 1,
    @Query(
      'limit',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    limit: number = 10,
  ): Promise<PaginatedUsersResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Parámetros de paginación inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.usersService.findAllByActive(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT')
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un usuario por su identificador',
    description:
      'Devuelve los datos públicos de un usuario. No expone contraseña ni datos sensibles.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 7,
    description: 'Identificador único del usuario',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario encontrado',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario solicitado',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ): Promise<UserResponse> {
    return this.usersService.findOne(+id);
  }

  @Patch('status/:id')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Activar o desactivar un usuario',
    description:
      'Cambia el estado `isActive` de un usuario. Notifica a los administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 7,
    description: 'Identificador único del usuario',
  })
  @ApiBody({ type: ChangeUserStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del usuario actualizado',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo actualizar el estado del usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario solicitado',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async changeStatus(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() changeUserStatusDto: ChangeUserStatusDto,
  ): Promise<UserResponse> {
    return this.usersService.changeStatus(+id, changeUserStatusDto.isActive);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT')
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un usuario existente',
    description:
      'Actualiza los datos de un usuario. Si se envía `password`, se hashea antes de almacenarse. ' +
      'Si se envía `email` o `userName`, se valida que no estén en uso por otro usuario.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 7,
    description: 'Identificador único del usuario a actualizar',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario actualizado exitosamente',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar el usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario solicitado',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Ya existe otro usuario con el mismo correo o nombre de usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar (soft delete) un usuario',
    description:
      'Marca el usuario como eliminado lógicamente. Notifica a los administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 7,
    description: 'Identificador único del usuario a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario eliminado correctamente',
    type: UserDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar el usuario',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario solicitado',
    type: UserErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ): Promise<UserDeleteResponse> {
    return this.usersService.remove(+id);
  }
}
