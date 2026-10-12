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
import { SuspensionService } from './suspension.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateSuspensionDto } from './dto/create-suspension.dto.js';
import { UpdateSuspensionDto } from './dto/update-suspension.dto.js';
import { ChangeSuspensionStatusDto } from './dto/change-suspension-status.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { SuspensionStatus } from '../../../../generated/prisma/enums.js';
import {
  PaginatedSuspensionsResponse,
  SuspensionDeleteResponse,
  SuspensionErrorResponse,
  SuspensionResponse,
} from './dto/suspension-response.dto.js';

@ApiTags('General - Suspensiones')
@ApiBearerAuth('JWT')
@Controller('suspension')
export class SuspensionController {
  constructor(private readonly suspensionService: SuspensionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Crear una nueva suspensión',
    description:
      'Crea una suspensión para un usuario. Notifica al usuario suspendido.',
  })
  @ApiBody({ type: CreateSuspensionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Suspensión creada exitosamente',
    type: SuspensionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la suspensión',
    type: SuspensionErrorResponse,
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
    @Body() createSuspensionDto: CreateSuspensionDto,
  ): Promise<SuspensionResponse> {
    return this.suspensionService.create(createSuspensionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Listar suspensiones con paginación',
    description:
      'Obtiene las suspensiones, opcionalmente filtradas por estado.',
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
    enum: SuspensionStatus,
    description: 'Filtrar suspensiones por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de suspensiones',
    type: PaginatedSuspensionsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: SuspensionErrorResponse,
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
    @Query('status') status?: SuspensionStatus,
  ): Promise<PaginatedSuspensionsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.suspensionService.findAll(page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Obtener una suspensión por su identificador',
    description:
      'Devuelve una suspensión con los datos del usuario y la multa relacionada.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la suspensión',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suspensión encontrada',
    type: SuspensionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: SuspensionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la suspensión',
    type: SuspensionErrorResponse,
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
  ): Promise<SuspensionResponse> {
    return this.suspensionService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Cambiar el estado de una suspensión',
    description: 'Permite actualizar el estado de una suspensión.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la suspensión',
  })
  @ApiBody({ type: ChangeSuspensionStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la suspensión actualizado',
    type: SuspensionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo actualizar el estado de la suspensión',
    type: SuspensionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la suspensión',
    type: SuspensionErrorResponse,
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
    @Body() changeSuspensionStatusDto: ChangeSuspensionStatusDto,
  ): Promise<SuspensionResponse> {
    return this.suspensionService.changeStatus(
      +id,
      changeSuspensionStatusDto.newStatus,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Actualizar una suspensión existente',
    description:
      'Permite modificar el motivo, fechas o estado de una suspensión. Notifica al usuario y a los administradores.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la suspensión a actualizar',
  })
  @ApiBody({ type: UpdateSuspensionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suspensión actualizada exitosamente',
    type: SuspensionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar la suspensión',
    type: SuspensionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la suspensión',
    type: SuspensionErrorResponse,
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
    @Body() updateSuspensionDto: UpdateSuspensionDto,
  ): Promise<SuspensionResponse> {
    return this.suspensionService.update(+id, updateSuspensionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Eliminar (soft delete) una suspensión',
    description: 'Marca la suspensión como eliminada lógicamente.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la suspensión a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suspensión eliminada correctamente',
    type: SuspensionDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la suspensión',
    type: SuspensionErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la suspensión',
    type: SuspensionErrorResponse,
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
  ): Promise<SuspensionDeleteResponse> {
    return this.suspensionService.remove(+id);
  }
}
