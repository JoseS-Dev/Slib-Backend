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
import { RequestService } from './request.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { RequestStatus } from '../../../../generated/prisma/enums.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  PaginatedRequestsResponse,
  RequestDeleteResponse,
  RequestErrorResponse,
  RequestResponse,
} from './dto/request-response.dto.js';

@ApiTags('Solicitudes')
@ApiBearerAuth('JWT')
@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Crear una nueva solicitud de libro',
    description:
      'Crea una solicitud de libro para un usuario. La solicitud queda en estado En_Revision y notifica a los recepcionistas.',
  })
  @ApiBody({ type: CreateRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Solicitud creada exitosamente',
    type: RequestResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el usuario con el ID proporcionado',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async create(@Body() createRequestDto: CreateRequestDto): Promise<RequestResponse> {
    return this.requestService.create(createRequestDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar todas las solicitudes',
    description:
      'Obtiene el listado paginado de todas las solicitudes del sistema, ordenadas por fecha de creación. Permite filtrar por estado.',
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
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RequestStatus,
    description: 'Filtrar solicitudes por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de solicitudes',
    type: PaginatedRequestsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: RequestErrorResponse,
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
    @Query('status') status?: RequestStatus,
  ): Promise<PaginatedRequestsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.requestService.findAll(page, limit, status);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario')
  @ApiOperation({
    summary: 'Listar las solicitudes de un usuario',
    description:
      'Obtiene el listado paginado de solicitudes de un usuario específico, ordenadas por fecha de creación. Permite filtrar por estado.',
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
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RequestStatus,
    description: 'Filtrar solicitudes por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de solicitudes del usuario',
    type: PaginatedRequestsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el usuario con el ID proporcionado',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByUser(
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
    @Query('status') status?: RequestStatus,
  ): Promise<PaginatedRequestsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.requestService.findAllByUser(userId, page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener una solicitud por su identificador',
    description: 'Devuelve una solicitud con los datos del usuario y los items asociados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la solicitud',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solicitud encontrada',
    type: RequestResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la solicitud solicitada',
    type: RequestErrorResponse,
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
  ): Promise<RequestResponse> {
    return this.requestService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Cambiar el estado de una solicitud',
    description:
      'Cambia el estado de una solicitud siguiendo la matriz de transiciones permitida. Si el destino es Cancelada, se requiere una razón de cancelación.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la solicitud',
  })
  @ApiBody({ type: UpdateRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la solicitud actualizado',
    type: RequestResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos, transición no permitida o razón de cancelación ausente',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la solicitud',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async updateStatus(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ): Promise<RequestResponse> {
    return this.requestService.changeStatus(+id, updateRequestDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Actualizar una solicitud existente',
    description: 'Permite modificar los datos de una solicitud (título, descripción, fecha, items).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la solicitud',
  })
  @ApiBody({ type: UpdateRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solicitud actualizada exitosamente',
    type: RequestResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: RequestErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la solicitud solicitada',
    type: RequestErrorResponse,
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
    @Body() updateRequestDto: UpdateRequestDto,
  ): Promise<RequestResponse> {
    return this.requestService.update(+id, updateRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Eliminar una solicitud',
    description:
      'Elimina una solicitud junto con todos sus items asociados. Notifica a los recepcionistas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la solicitud a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solicitud eliminada correctamente',
    type: RequestDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la solicitud',
    type: RequestErrorResponse,
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
  ): Promise<RequestDeleteResponse> {
    return this.requestService.remove(+id);
  }
}
