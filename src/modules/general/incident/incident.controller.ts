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
import { IncidentService } from './incident.service.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import { ChangeIncidentStatusDto } from './dto/change-incident-status.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  IncidentDeleteResponse,
  IncidentErrorResponse,
  IncidentResponse,
  PaginatedIncidentsResponse,
} from './dto/incident-response.dto.js';

@ApiTags('General - Incidencias')
@ApiBearerAuth('JWT')
@Controller('incident')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Reportar una nueva incidencia',
    description:
      'Crea un registro de incidencia. Notifica a los administradores y recepcionistas.',
  })
  @ApiBody({ type: CreateIncidentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Incidencia creada exitosamente',
    type: IncidentResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la incidencia',
    type: IncidentErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario, ejemplar físico o préstamo relacionado',
    type: IncidentErrorResponse,
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
    @Body() createIncidentDto: CreateIncidentDto,
  ): Promise<IncidentResponse> {
    return this.incidentService.create(createIncidentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar incidencias con paginación',
    description:
      'Obtiene todas las incidencias, opcionalmente filtradas por mes de creación.',
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
    name: 'month',
    required: false,
    type: Number,
    example: 1,
    description: 'Filtrar incidencias por mes de creación (1-12)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de incidencias',
    type: PaginatedIncidentsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
    type: IncidentErrorResponse,
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
    @Query(
      'month',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    month?: number,
  ): Promise<PaginatedIncidentsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.incidentService.findAll(page, limit, month);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar incidencias de un usuario',
    description:
      'Obtiene las incidencias reportadas por un usuario específico con paginación.',
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
    name: 'month',
    required: false,
    type: Number,
    example: 1,
    description: 'Filtrar incidencias por mes de creación (1-12)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de incidencias del usuario',
    type: PaginatedIncidentsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
    type: IncidentErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario especificado',
    type: IncidentErrorResponse,
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
    @Query(
      'month',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    month?: number,
  ): Promise<PaginatedIncidentsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.incidentService.findAllByUser(userId, page, limit, month);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener una incidencia por su identificador',
    description:
      'Devuelve una incidencia con los datos del usuario, ejemplar físico y préstamo relacionados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la incidencia',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Incidencia encontrada',
    type: IncidentResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: IncidentErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la incidencia',
    type: IncidentErrorResponse,
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
  ): Promise<IncidentResponse> {
    return this.incidentService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Cambiar el estado de una incidencia',
    description:
      'Permite a un administrador o recepcionista actualizar el estado de una incidencia.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la incidencia',
  })
  @ApiBody({ type: ChangeIncidentStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la incidencia actualizado',
    type: IncidentResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo actualizar el estado de la incidencia',
    type: IncidentErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la incidencia',
    type: IncidentErrorResponse,
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
    @Body() changeIncidentStatusDto: ChangeIncidentStatusDto,
  ): Promise<IncidentResponse> {
    return this.incidentService.changeStatus(
      +id,
      changeIncidentStatusDto.newStatus,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Actualizar una incidencia existente',
    description:
      'Permite modificar los datos de una incidencia (título, descripción, tipo, mensaje del admin o estado).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la incidencia a actualizar',
  })
  @ApiBody({ type: UpdateIncidentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Incidencia actualizada exitosamente',
    type: IncidentResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar la incidencia',
    type: IncidentErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la incidencia',
    type: IncidentErrorResponse,
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
    @Body() updateIncidentDto: UpdateIncidentDto,
  ): Promise<IncidentResponse> {
    return this.incidentService.update(+id, updateIncidentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Eliminar (soft delete) una incidencia',
    description: 'Marca la incidencia como eliminada lógicamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la incidencia a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Incidencia eliminada correctamente',
    type: IncidentDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la incidencia',
    type: IncidentErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la incidencia',
    type: IncidentErrorResponse,
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
  ): Promise<IncidentDeleteResponse> {
    return this.incidentService.remove(+id);
  }
}
