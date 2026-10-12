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
import { ReviewService } from './review.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ChangeReviewStatusDto } from './dto/change-review-status.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  PaginatedReviewsResponse,
  ReviewDeleteResponse,
  ReviewErrorResponse,
  ReviewResponse,
} from './dto/review-response.dto.js';

@ApiTags('General - Reseñas')
@ApiBearerAuth('JWT')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Crear una nueva reseña',
    description:
      'Crea una reseña para un libro. Notifica a los administradores.',
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reseña creada exitosamente',
    type: ReviewResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la reseña',
    type: ReviewErrorResponse,
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
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponse> {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar reseñas con paginación',
    description:
      'Obtiene todas las reseñas con los datos del usuario y del libro.',
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
    description: 'Listado paginado de reseñas',
    type: PaginatedReviewsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: ReviewErrorResponse,
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
  ): Promise<PaginatedReviewsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.reviewService.findAll(page, limit);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Listar reseñas de un usuario',
    description: 'Obtiene las reseñas activas realizadas por un usuario.',
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de reseñas del usuario',
    type: PaginatedReviewsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario especificado',
    type: ReviewErrorResponse,
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
  ): Promise<PaginatedReviewsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.reviewService.findAllByUser(userId, page, limit);
  }

  @Get('book/:bookId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar reseñas de un libro',
    description: 'Obtiene las reseñas activas de un libro específico.',
  })
  @ApiParam({
    name: 'bookId',
    type: Number,
    example: 14,
    description: 'Identificador del libro',
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
    description: 'Listado paginado de reseñas del libro',
    type: PaginatedReviewsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el libro especificado',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByBook(
    @Param(
      'bookId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    bookId: number,
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
  ): Promise<PaginatedReviewsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.reviewService.findAllByBook(bookId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Obtener una reseña por su identificador',
    description: 'Devuelve una reseña por su id.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la reseña',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña encontrada',
    type: ReviewResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la reseña',
    type: ReviewErrorResponse,
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
  ): Promise<ReviewResponse> {
    return this.reviewService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Activar o desactivar una reseña',
    description: 'Cambia el estado `isActive` de una reseña.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la reseña',
  })
  @ApiBody({ type: ChangeReviewStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la reseña actualizado',
    type: ReviewResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo actualizar la reseña',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la reseña',
    type: ReviewErrorResponse,
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
    @Body() changeReviewStatusDto: ChangeReviewStatusDto,
  ): Promise<ReviewResponse> {
    return this.reviewService.changeStatus(+id, changeReviewStatusDto.isActive);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Actualizar una reseña existente',
    description:
      'Permite modificar la calificación, comentario o estado de una reseña.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la reseña a actualizar',
  })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña actualizada exitosamente',
    type: ReviewResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar la reseña',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la reseña',
    type: ReviewErrorResponse,
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
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponse> {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Eliminar una reseña',
    description: 'Elimina una reseña del sistema.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la reseña a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña eliminada correctamente',
    type: ReviewDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la reseña',
    type: ReviewErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la reseña',
    type: ReviewErrorResponse,
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
  ): Promise<ReviewDeleteResponse> {
    return this.reviewService.remove(+id);
  }
}
