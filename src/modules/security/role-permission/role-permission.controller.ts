import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  HttpCode,
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
import { settings } from '../../../config/settings.config.js';
import { RolePermissionService } from './role-permission.service.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto.js';
import {
  PaginatedRolePermissionsResponse,
  RolePermissionDeleteResponse,
  RolePermissionErrorResponse,
  RolePermissionResponse,
} from './dto/role-permission-response.dto.js';

@ApiTags('Seguridad - Asociación Rol-Permiso')
@ApiBearerAuth('JWT')
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asociar un permiso a un rol',
    description:
      'Crea la asociación entre un rol y un permiso existentes. Notifica a los administradores.',
  })
  @ApiBody({ type: CreateRolePermissionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Asociación rol-permiso creada exitosamente',
    type: RolePermissionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la asociación',
    type: RolePermissionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el rol o el permiso especificado',
    type: RolePermissionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async create(
    @Body() createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermissionResponse> {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @Get()
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar asociaciones rol-permiso con paginación',
    description:
      'Obtiene todas las asociaciones activas entre roles y permisos, ordenadas por roleId.',
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
    description: 'Listado paginado de asociaciones rol-permiso',
    type: PaginatedRolePermissionsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: RolePermissionErrorResponse,
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
  ): Promise<PaginatedRolePermissionsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Parámetros de paginación inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.rolePermissionService.findAll(page, limit);
  }

  @Get('role/:roleId')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar permisos de un rol específico',
    description:
      'Obtiene todas las asociaciones de permisos de un rol con paginación.',
  })
  @ApiParam({
    name: 'roleId',
    type: Number,
    example: 1,
    description: 'Identificador del rol',
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
    description: 'Listado paginado de permisos del rol',
    type: PaginatedRolePermissionsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
    type: RolePermissionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el rol especificado',
    type: RolePermissionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByRole(
    @Param(
      'roleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    roleId: number,
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
  ): Promise<PaginatedRolePermissionsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Parámetros de paginación inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.rolePermissionService.findAllByRole(roleId, page, limit);
  }

  @Delete('/role/:roleId/permission/:permissionId')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar la asociación entre un rol y un permiso',
    description:
      'Elimina la relación entre un rol y un permiso. Notifica a los administradores.',
  })
  @ApiParam({
    name: 'roleId',
    type: Number,
    example: 1,
    description: 'Identificador del rol',
  })
  @ApiParam({
    name: 'permissionId',
    type: Number,
    example: 5,
    description: 'Identificador del permiso',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asociación eliminada exitosamente',
    type: RolePermissionDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la asociación',
    type: RolePermissionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe la asociación entre el rol y el permiso',
    type: RolePermissionErrorResponse,
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
      'roleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    roleId: number,
    @Param(
      'permissionId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    permissionId: number,
  ): Promise<RolePermissionDeleteResponse> {
    return this.rolePermissionService.remove(roleId, permissionId);
  }
}
