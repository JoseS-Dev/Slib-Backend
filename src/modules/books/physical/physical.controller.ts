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
import { PhysicalService } from './physical.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreatePhysicalDto } from './dto/create-physical.dto.js';
import { UpdatePhysicalDto } from './dto/update-physical.dto.js';
import { ChangePhysicalStatusDto } from './dto/change-physical-status.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { PhysicalCopyStatus } from '../../../../generated/prisma/enums.js';
import {
  PaginatedPhysicalsResponse,
  PhysicalDeleteResponse,
  PhysicalErrorResponse,
  PhysicalResponse,
} from './dto/physical-response.dto.js';

@ApiTags('Libros - Ejemplares Físicos')
@ApiBearerAuth('JWT')
@Controller('physical')
export class PhysicalController {
  constructor(private readonly physicalService: PhysicalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Crear un nuevo ejemplar físico',
    description:
      'Crea un nuevo ejemplar físico para un libro existente. El número de copia debe ser único.',
  })
  @ApiBody({ type: CreatePhysicalDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ejemplar físico creado exitosamente',
    type: PhysicalResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: PhysicalErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un ejemplar con el mismo número de copia',
    type: PhysicalErrorResponse,
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
    @Body() createPhysicalDto: CreatePhysicalDto,
  ): Promise<PhysicalResponse> {
    return this.physicalService.create(createPhysicalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar todos los ejemplares físicos',
    description:
      'Obtiene el listado paginado de ejemplares físicos del sistema. Permite filtrar por estado.',
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
    enum: PhysicalCopyStatus,
    description: 'Filtrar ejemplares por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de ejemplares físicos',
    type: PaginatedPhysicalsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: PhysicalErrorResponse,
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
    @Query('status') status?: PhysicalCopyStatus,
  ): Promise<PaginatedPhysicalsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.physicalService.findAll(page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener un ejemplar físico por su identificador',
    description: 'Devuelve un ejemplar físico con los datos del libro asociado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del ejemplar físico',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ejemplar físico encontrado',
    type: PhysicalResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: PhysicalErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el ejemplar físico solicitado',
    type: PhysicalErrorResponse,
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
  ): Promise<PhysicalResponse> {
    return this.physicalService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Cambiar el estado de un ejemplar físico',
    description:
      'Cambia el estado de un ejemplar físico siguiendo la matriz de transiciones permitida.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del ejemplar físico',
  })
  @ApiBody({ type: ChangePhysicalStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del ejemplar actualizado',
    type: PhysicalResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos, transición no permitida o estado igual al actual',
    type: PhysicalErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el ejemplar físico',
    type: PhysicalErrorResponse,
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
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() changePhysicalStatusDto: ChangePhysicalStatusDto,
  ): Promise<PhysicalResponse> {
    return this.physicalService.changeStatus(+id, changePhysicalStatusDto.newStatus);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Actualizar un ejemplar físico',
    description: 'Permite modificar el número de copia, la ubicación o el estado de un ejemplar físico.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del ejemplar físico',
  })
  @ApiBody({ type: UpdatePhysicalDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ejemplar físico actualizado exitosamente',
    type: PhysicalResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: PhysicalErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe otro ejemplar con el nuevo número de copia',
    type: PhysicalErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el ejemplar físico solicitado',
    type: PhysicalErrorResponse,
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
    @Body() updatePhysicalDto: UpdatePhysicalDto,
  ): Promise<PhysicalResponse> {
    return this.physicalService.update(+id, updatePhysicalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Eliminar un ejemplar físico',
    description: 'Realiza un soft delete del ejemplar físico y del libro asociado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del ejemplar físico a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ejemplar físico eliminado correctamente',
    type: PhysicalDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el ejemplar físico',
    type: PhysicalErrorResponse,
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
  ): Promise<PhysicalDeleteResponse> {
    return this.physicalService.remove(+id);
  }
}
