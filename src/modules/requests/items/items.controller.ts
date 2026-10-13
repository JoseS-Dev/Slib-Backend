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
import { ItemsService } from './items.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  ItemDeleteResponse,
  ItemErrorResponse,
  ItemResponse,
  PaginatedItemsResponse,
} from './dto/item-response.dto.js';

@ApiTags('Items de Solicitud')
@ApiBearerAuth('JWT')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Usuario')
  @ApiOperation({
    summary: 'Crear un nuevo item de solicitud',
    description:
      'Crea un item (ejemplar físico) dentro de una solicitud existente.',
  })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Item creado exitosamente',
    type: ItemResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: ItemErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la solicitud o el ejemplar físico',
    type: ItemErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async create(@Body() createItemDto: CreateItemDto): Promise<ItemResponse> {
    return this.itemsService.create(createItemDto);
  }

  @Get('request/:requestId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Listar los items de una solicitud',
    description:
      'Obtiene el listado paginado de items (ejemplares) asociados a una solicitud.',
  })
  @ApiParam({
    name: 'requestId',
    type: Number,
    example: 4,
    description: 'Identificador de la solicitud',
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
    description: 'Listado paginado de items de la solicitud',
    type: PaginatedItemsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: ItemErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la solicitud',
    type: ItemErrorResponse,
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
    @Param('requestId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) requestId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ): Promise<PaginatedItemsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.', HttpStatus.BAD_REQUEST);
    }
    return this.itemsService.findAll(requestId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Obtener un item por su identificador',
    description: 'Devuelve un item con los datos de la solicitud y del ejemplar físico asociado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del item',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item encontrado',
    type: ItemResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: ItemErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el item solicitado',
    type: ItemErrorResponse,
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
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ): Promise<ItemResponse> {
    return this.itemsService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Actualizar el estado de un item',
    description:
      'Permite cambiar el estado de un item siguiendo la matriz de transiciones permitida.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del item',
  })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item actualizado exitosamente',
    type: ItemResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos, transición no permitida o estado igual al actual',
    type: ItemErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el item solicitado',
    type: ItemErrorResponse,
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
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<ItemResponse> {
    return this.itemsService.update(+id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Administrador')
  @ApiOperation({
    summary: 'Eliminar un item',
    description: 'Elimina un item de una solicitud.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del item a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item eliminado correctamente',
    type: ItemDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el item',
    type: ItemErrorResponse,
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
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ): Promise<ItemDeleteResponse> {
    return this.itemsService.remove(+id);
  }
}
