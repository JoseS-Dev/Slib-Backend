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
import { FineService } from './fine.service.js';
import { CreateFineDto } from './dto/create-fine.dto.js';
import { UpdateFineDto } from './dto/update-fine.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { FineStatus } from '../../../../generated/prisma/enums.js';
import {
  FineDeleteResponse,
  FineErrorResponse,
  FineResponse,
  PaginatedFinesResponse,
} from './dto/fine-response.dto.js';

@ApiTags('Multas')
@ApiBearerAuth('JWT')
@Controller('fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Crear una nueva multa',
    description:
      'Crea una multa para un usuario a partir de un préstamo en estado Vencido. Notifica al usuario.',
  })
  @ApiBody({ type: CreateFineDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Multa creada exitosamente',
    type: FineResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: FineErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'No se encontró el usuario o el préstamo no está en estado Vencido',
    type: FineErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async create(@Body() createFineDto: CreateFineDto): Promise<FineResponse> {
    return this.fineService.create(createFineDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Listar todas las multas',
    description:
      'Obtiene el listado paginado de todas las multas del sistema, ordenadas por fecha de creación. Permite filtrar por estado.',
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
    enum: FineStatus,
    description: 'Filtrar multas por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de multas',
    type: PaginatedFinesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: FineErrorResponse,
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
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
    @Query('status') status?: FineStatus,
  ): Promise<PaginatedFinesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.', HttpStatus.BAD_REQUEST);
    }
    return this.fineService.findAll(page, limit, status);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar las multas de un usuario',
    description:
      'Obtiene el listado paginado de multas de un usuario específico, ordenadas por fecha de creación. Permite filtrar por estado.',
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
    enum: FineStatus,
    description: 'Filtrar multas por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de multas del usuario',
    type: PaginatedFinesResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: FineErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el usuario especificado',
    type: FineErrorResponse,
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
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
    @Query('status') status?: FineStatus,
  ): Promise<PaginatedFinesResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.', HttpStatus.BAD_REQUEST);
    }
    return this.fineService.findAllByUser(userId, page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Obtener una multa por su identificador',
    description: 'Devuelve una multa con los datos del préstamo asociado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la multa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Multa encontrada',
    type: FineResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: FineErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la multa solicitada',
    type: FineErrorResponse,
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
  ): Promise<FineResponse> {
    return this.fineService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Actualizar una multa existente',
    description:
      'Permite modificar el monto, la razón o el estado de una multa. Notifica a los administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la multa',
  })
  @ApiBody({ type: UpdateFineDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Multa actualizada exitosamente',
    type: FineResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: FineErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la multa solicitada',
    type: FineErrorResponse,
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
    @Body() updateFineDto: UpdateFineDto,
  ): Promise<FineResponse> {
    return this.fineService.update(+id, updateFineDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Eliminar una multa',
    description:
      'Elimina una multa del sistema. Notifica a los administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la multa a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Multa eliminada correctamente',
    type: FineDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la multa',
    type: FineErrorResponse,
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
  ): Promise<FineDeleteResponse> {
    return this.fineService.remove(+id);
  }
}
