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
import { LoanService } from './loan.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateLoanDto } from './dto/create-loan.dto.js';
import { UpdateLoanDto } from './dto/update-loan.dto.js';
import { ChangeLoanStatusDto } from './dto/change-loan-status.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { LoanStatus } from '../../../../generated/prisma/enums.js';
import {
  LoanDeleteResponse,
  LoanErrorResponse,
  LoanResponse,
  PaginatedLoansResponse,
} from './dto/loan-response.dto.js';

@ApiTags('Préstamos')
@ApiBearerAuth('JWT')
@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Crear un nuevo préstamo',
    description:
      'Crea un préstamo a partir de un item de solicitud y un ejemplar físico. Cambia el estado del ejemplar a Prestado y notifica al recepcionista.',
  })
  @ApiBody({ type: CreateLoanDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Préstamo creado exitosamente',
    type: LoanResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: LoanErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'No se encontró el item de solicitud, el ejemplar físico o el recepcionista',
    type: LoanErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async create(@Body() createLoanDto: CreateLoanDto): Promise<LoanResponse> {
    return this.loanService.create(createLoanDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Listar todos los préstamos',
    description:
      'Obtiene el listado paginado de todos los préstamos del sistema, ordenados por fecha de préstamo. Permite filtrar por estado.',
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
    enum: LoanStatus,
    description: 'Filtrar préstamos por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de préstamos',
    type: PaginatedLoansResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: LoanErrorResponse,
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
    @Query('status') status?: LoanStatus,
  ): Promise<PaginatedLoansResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.loanService.findAll(page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Obtener un préstamo por su identificador',
    description: 'Devuelve un préstamo con los datos del item y del ejemplar físico asociado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del préstamo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Préstamo encontrado',
    type: LoanResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: LoanErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el préstamo solicitado',
    type: LoanErrorResponse,
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
  ): Promise<LoanResponse> {
    return this.loanService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Cambiar el estado de un préstamo',
    description:
      'Cambia el estado de un préstamo siguiendo la matriz de transiciones permitida. Notifica al recepcionista.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del préstamo',
  })
  @ApiBody({ type: ChangeLoanStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del préstamo actualizado',
    type: LoanResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos, transición no permitida o estado igual al actual',
    type: LoanErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el préstamo',
    type: LoanErrorResponse,
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
    @Body() changeLoanStatusDto: ChangeLoanStatusDto,
  ): Promise<LoanResponse> {
    return this.loanService.changeStatus(+id, changeLoanStatusDto.newStatus);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  @ApiOperation({
    summary: 'Actualizar un préstamo existente',
    description: 'Permite modificar las fechas y el estado de un préstamo.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del préstamo',
  })
  @ApiBody({ type: UpdateLoanDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Préstamo actualizado exitosamente',
    type: LoanResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: LoanErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el préstamo solicitado',
    type: LoanErrorResponse,
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
    @Body() updateLoanDto: UpdateLoanDto,
  ): Promise<LoanResponse> {
    return this.loanService.update(+id, updateLoanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Eliminar un préstamo',
    description:
      'Elimina un préstamo del sistema. No se permite eliminar préstamos en estado Activo. Notifica a administradores y recepcionistas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del préstamo a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Préstamo eliminado correctamente',
    type: LoanDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se puede eliminar un préstamo con estado Activo',
    type: LoanErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el préstamo',
    type: LoanErrorResponse,
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
  ): Promise<LoanDeleteResponse> {
    return this.loanService.remove(+id);
  }
}
