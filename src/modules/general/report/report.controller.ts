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
import { ReportService } from './report.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { ChangeReportStatusDto } from './dto/change-report-status.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  PaginatedReportsResponse,
  ReportDeleteResponse,
  ReportErrorResponse,
  ReportResponse,
} from './dto/report-response.dto.js';

@ApiTags('General - Reportes')
@ApiBearerAuth('JWT')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Crear un nuevo reporte',
    description:
      'Crea un reporte administrativo. Notifica a los administradores.',
  })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reporte creado exitosamente',
    type: ReportResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear el reporte',
    type: ReportErrorResponse,
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
    @Body() createReportDto: CreateReportDto,
  ): Promise<ReportResponse> {
    return this.reportService.create(createReportDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar reportes con paginación',
    description:
      'Obtiene todos los reportes, opcionalmente filtrados por mes de creación.',
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
    description: 'Filtrar reportes por mes de creación (1-12)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de reportes',
    type: PaginatedReportsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
    type: ReportErrorResponse,
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
  ): Promise<PaginatedReportsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.reportService.findAll(page, limit, month);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar reportes de un usuario',
    description:
      'Obtiene los reportes generados por un usuario específico con paginación.',
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
    description: 'Filtrar reportes por mes de creación (1-12)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de reportes del usuario',
    type: PaginatedReportsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros inválidos',
    type: ReportErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario o no tiene permisos para ver reportes',
    type: ReportErrorResponse,
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
  ): Promise<PaginatedReportsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.reportService.findAllByUser(userId, page, limit, month);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Obtener un reporte por su identificador',
    description: 'Devuelve un reporte con los datos del usuario que lo generó.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del reporte',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte encontrado',
    type: ReportResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: ReportErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el reporte',
    type: ReportErrorResponse,
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
  ): Promise<ReportResponse> {
    return this.reportService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Activar o desactivar un reporte',
    description:
      'Cambia el estado `isActive` de un reporte. Se envía `isActive` como número (1=activo, 0=inactivo).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del reporte',
  })
  @ApiBody({ type: ChangeReportStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del reporte actualizado',
    type: ReportResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos o no se pudo actualizar el estado del reporte',
    type: ReportErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el reporte',
    type: ReportErrorResponse,
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
    @Body() changeReportStatusDto: ChangeReportStatusDto,
  ): Promise<ReportResponse> {
    return this.reportService.changeStatus(+id, changeReportStatusDto.isActive);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Actualizar un reporte existente',
    description:
      'Permite modificar los datos de un reporte. Notifica a los administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del reporte a actualizar',
  })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte actualizado exitosamente',
    type: ReportResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar el reporte',
    type: ReportErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el reporte',
    type: ReportErrorResponse,
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
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ReportResponse> {
    return this.reportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Eliminar (soft delete) un reporte',
    description: 'Marca el reporte como eliminado lógicamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del reporte a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte eliminado correctamente',
    type: ReportDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar el reporte',
    type: ReportErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el reporte',
    type: ReportErrorResponse,
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
  ): Promise<ReportDeleteResponse> {
    return this.reportService.remove(+id);
  }
}
