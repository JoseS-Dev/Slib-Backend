import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  HttpException,
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
import { FavoritesService } from './favorites.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { UpdateFavoriteDto } from './dto/update-favorite.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  FavoriteDeleteResponse,
  FavoriteErrorResponse,
  FavoriteResponse,
  PaginatedFavoritesResponse,
} from './dto/favorite-response.dto.js';

@ApiTags('General - Favoritos')
@ApiBearerAuth('JWT')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Marcar un libro como favorito',
    description:
      'Crea un registro de libro favorito para un usuario. No se permite duplicar el mismo libro para un usuario.',
  })
  @ApiBody({ type: CreateFavoriteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Favorito creado exitosamente',
    type: FavoriteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear el favorito',
    type: FavoriteErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario o el libro especificado',
    type: FavoriteErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El usuario ya tiene este libro en favoritos',
    type: FavoriteErrorResponse,
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
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteResponse> {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario')
  @ApiOperation({
    summary: 'Listar los favoritos de un usuario',
    description:
      'Obtiene el listado paginado de libros favoritos de un usuario, ordenados por fecha de creación. Incluye los datos del libro.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    example: 7,
    description: 'Identificador del usuario',
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
    description: 'Listado paginado de favoritos del usuario',
    type: PaginatedFavoritesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: FavoriteErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario especificado',
    type: FavoriteErrorResponse,
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
    @Param(
      'userId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    userId: number,
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
  ): Promise<PaginatedFavoritesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.favoritesService.findAll(userId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Obtener un favorito por su identificador',
    description: 'Devuelve un favorito con los datos del libro asociado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del favorito',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorito encontrado',
    type: FavoriteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: FavoriteErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el favorito solicitado',
    type: FavoriteErrorResponse,
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
  ): Promise<FavoriteResponse> {
    return this.favoritesService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Actualizar un favorito existente',
    description: 'Permite activar o desactivar un favorito.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del favorito a actualizar',
  })
  @ApiBody({ type: UpdateFavoriteDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorito actualizado exitosamente',
    type: FavoriteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar el favorito',
    type: FavoriteErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el favorito solicitado',
    type: FavoriteErrorResponse,
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
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ): Promise<FavoriteResponse> {
    return this.favoritesService.update(+id, updateFavoriteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Eliminar un favorito',
    description: 'Elimina un libro de los favoritos de un usuario.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del favorito a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorito eliminado correctamente',
    type: FavoriteDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar el favorito',
    type: FavoriteErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el favorito solicitado',
    type: FavoriteErrorResponse,
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
  ): Promise<FavoriteDeleteResponse> {
    return this.favoritesService.remove(+id);
  }
}
