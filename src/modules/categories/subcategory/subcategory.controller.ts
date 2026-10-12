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
  Query,
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
import { settings } from '../../../config/settings.config.js';
import { SubcategoryService } from './subcategory.service.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto.js';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto.js';
import {
  PaginatedSubcategoriesResponse,
  SubcategoryDeleteResponse,
  SubcategoryErrorResponse,
  SubcategoryResponse,
} from './dto/subcategory-response.dto.js';

@ApiTags('Subcategorías')
@ApiBearerAuth('JWT')
@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva subcategoría',
    description:
      'Crea una subcategoría asociada a una categoría existente. Notifica a los administradores y recepcionistas.',
  })
  @ApiBody({ type: CreateSubcategoryDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subcategoría creada exitosamente',
    type: SubcategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la subcategoría',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una subcategoría con el mismo nombre',
    type: SubcategoryErrorResponse,
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
    @Body() createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<SubcategoryResponse> {
    return this.subcategoryService.create(createSubcategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar subcategorías con paginación',
    description:
      'Obtiene todas las subcategorías (incluidas las inactivas) ordenadas por fecha de creación.',
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
    description: 'Listado paginado de subcategorías',
    type: PaginatedSubcategoriesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: SubcategoryErrorResponse,
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
  ): Promise<PaginatedSubcategoriesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.subcategoryService.findAll(page, limit);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar subcategorías activas con paginación',
    description: 'Obtiene únicamente las subcategorías con `isActive=true`.',
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
    description: 'Listado paginado de subcategorías activas',
    type: PaginatedSubcategoriesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: SubcategoryErrorResponse,
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
  ): Promise<PaginatedSubcategoriesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.subcategoryService.findAllActive(page, limit);
  }

  @Get('category/:categoryId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar subcategorías de una categoría específica',
    description:
      'Obtiene todas las subcategorías (activas e inactivas) asociadas a una categoría padre con paginación.',
  })
  @ApiParam({
    name: 'categoryId',
    type: Number,
    example: 1,
    description: 'Identificador de la categoría padre',
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
    description: 'Listado paginado de subcategorías de la categoría',
    type: PaginatedSubcategoriesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La categoría especificada no existe',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByCategoryId(
    @Param(
      'categoryId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    categoryId: number,
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
  ): Promise<PaginatedSubcategoriesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.subcategoryService.findAllByCategoryId(categoryId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener una subcategoría por su identificador',
    description: 'Devuelve una subcategoría activa por su id.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la subcategoría',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategoría encontrada',
    type: SubcategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La subcategoría no existe',
    type: SubcategoryErrorResponse,
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
  ): Promise<SubcategoryResponse> {
    return this.subcategoryService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Actualizar una subcategoría existente',
    description:
      'Actualiza los datos de una subcategoría. Notifica a los administradores y recepcionistas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la subcategoría a actualizar',
  })
  @ApiBody({ type: UpdateSubcategoryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategoría actualizada exitosamente',
    type: SubcategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar la subcategoría',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La subcategoría no existe',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe otra subcategoría con el mismo nombre',
    type: SubcategoryErrorResponse,
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
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<SubcategoryResponse> {
    return this.subcategoryService.update(+id, updateSubcategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Eliminar (soft delete) una subcategoría',
    description:
      'Marca la subcategoría como eliminada lógicamente. Notifica a los administradores y recepcionistas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la subcategoría a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategoría eliminada correctamente',
    type: SubcategoryDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la subcategoría',
    type: SubcategoryErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'La subcategoría no existe',
    type: SubcategoryErrorResponse,
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
  ): Promise<SubcategoryDeleteResponse> {
    return this.subcategoryService.remove(+id);
  }
}
