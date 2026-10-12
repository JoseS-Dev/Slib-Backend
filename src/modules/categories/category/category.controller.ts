import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
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
import { CategoryService } from './category.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ChangeCategoryStatusDto } from './dto/change-category-status.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  CategoryDeleteResponse,
  CategoryErrorResponse,
  CategoryResponse,
  PaginatedCategoriesResponse,
} from './dto/category-response.dto.js';

@ApiTags('Categorías')
@ApiBearerAuth('JWT')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva categoría',
    description:
      'Crea una categoría y, opcionalmente, sus subcategorías iniciales en una sola transacción. Notifica a los administradores y recepcionistas.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categoría creada exitosamente',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la categoría',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una categoría con el mismo nombre',
    type: CategoryErrorResponse,
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
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar categorías con paginación',
    description:
      'Obtiene todas las categorías (incluidas las inactivas) con sus subcategorías, ordenadas por fecha de creación.',
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
    description: 'Listado paginado de categorías',
    type: PaginatedCategoriesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: CategoryErrorResponse,
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
  ): Promise<PaginatedCategoriesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.categoryService.findAll(page, limit);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar categorías activas con paginación',
    description:
      'Obtiene únicamente las categorías con `isActive=true`, junto con sus subcategorías.',
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
    description: 'Listado paginado de categorías activas',
    type: PaginatedCategoriesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllActive(
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
  ): Promise<PaginatedCategoriesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.categoryService.findAllActive(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener una categoría por su identificador',
    description: 'Devuelve una categoría con todas sus subcategorías.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la categoría',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría encontrada',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la categoría',
    type: CategoryErrorResponse,
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
  ): Promise<CategoryResponse> {
    return this.categoryService.findOne(+id);
  }

  @Patch('status/:id')
  @Roles('Administrador', 'Recepcionista')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar o desactivar una categoría',
    description:
      'Cambia el estado `isActive` de una categoría. Notifica a los administradores y recepcionistas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la categoría',
  })
  @ApiBody({ type: ChangeCategoryStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la categoría actualizado',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo actualizar el estado de la categoría',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la categoría',
    type: CategoryErrorResponse,
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
    @Body() changeCategoryStatusDto: ChangeCategoryStatusDto,
  ): Promise<CategoryResponse> {
    return this.categoryService.changeStatus(
      +id,
      changeCategoryStatusDto.isActive,
    );
  }

  @Patch(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar una categoría existente',
    description:
      'Actualiza los datos de una categoría. Si se envía `subCategories`, se crean como subcategorías adicionales (no reemplazan las existentes).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la categoría a actualizar',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría actualizada exitosamente',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar la categoría',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la categoría',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe otra categoría con el mismo nombre',
    type: CategoryErrorResponse,
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
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar (soft delete) una categoría',
    description:
      'Marca la categoría como eliminada lógicamente. Notifica a los administradores y recepcionistas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la categoría a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría eliminada correctamente',
    type: CategoryDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la categoría',
    type: CategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la categoría',
    type: CategoryErrorResponse,
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
  ): Promise<CategoryDeleteResponse> {
    return this.categoryService.remove(+id);
  }
}
