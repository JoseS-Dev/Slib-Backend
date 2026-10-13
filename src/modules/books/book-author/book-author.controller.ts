import {
  Controller,
  Get,
  Post,
  Body,
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
import { settings } from '../../../config/settings.config.js';
import { BookAuthorService } from './book-author.service.js';
import { CreateBookAuthorDto } from './dto/create-book-author.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import {
  BookAuthorDeleteResponse,
  BookAuthorErrorResponse,
  BookAuthorResponse,
  PaginatedBookAuthorsResponse,
} from './dto/book-author-response.dto.js';

@ApiTags('Libros - Relación Libro-Autor')
@ApiBearerAuth('JWT')
@Controller('book-author')
export class BookAuthorController {
  constructor(private readonly bookAuthorService: BookAuthorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Crear relación libro-autor',
    description:
      'Asocia un libro existente con un autor existente. La combinación (bookId, authorId) debe ser única.',
  })
  @ApiBody({ type: CreateBookAuthorDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Relación libro-autor creada exitosamente',
    type: BookAuthorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: BookAuthorErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el libro o el autor con los IDs proporcionados',
    type: BookAuthorErrorResponse,
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
    @Body() createBookAuthorDto: CreateBookAuthorDto,
  ): Promise<BookAuthorResponse> {
    return this.bookAuthorService.create(createBookAuthorDto);
  }

  @Get('book/:bookId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar autores de un libro',
    description: 'Obtiene el listado paginado de autores asociados a un libro específico.',
  })
  @ApiParam({
    name: 'bookId',
    type: Number,
    example: 1,
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
    description: 'Listado paginado de autores del libro',
    type: PaginatedBookAuthorsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: BookAuthorErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el libro',
    type: BookAuthorErrorResponse,
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
    @Param('bookId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) bookId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ): Promise<PaginatedBookAuthorsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.bookAuthorService.findAllByBook(bookId, page, limit);
  }

  @Get('author/:authorId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar libros de un autor',
    description: 'Obtiene el listado paginado de libros asociados a un autor específico.',
  })
  @ApiParam({
    name: 'authorId',
    type: Number,
    example: 4,
    description: 'Identificador del autor',
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
    description: 'Listado paginado de libros del autor',
    type: PaginatedBookAuthorsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: BookAuthorErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el autor',
    type: BookAuthorErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByAuthor(
    @Param('authorId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) authorId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ): Promise<PaginatedBookAuthorsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.bookAuthorService.findAllByAuthor(authorId, page, limit);
  }

  @Delete('/book/:bookId/author/:authorId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Eliminar relación libro-autor',
    description: 'Elimina la asociación entre un libro y un autor.',
  })
  @ApiParam({
    name: 'bookId',
    type: Number,
    example: 1,
    description: 'Identificador del libro',
  })
  @ApiParam({
    name: 'authorId',
    type: Number,
    example: 4,
    description: 'Identificador del autor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relación eliminada correctamente',
    type: BookAuthorDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la relación entre el libro y el autor',
    type: BookAuthorErrorResponse,
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
    @Param('bookId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) bookId: number,
    @Param('authorId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) authorId: number,
  ): Promise<BookAuthorDeleteResponse> {
    return this.bookAuthorService.remove(bookId, authorId);
  }
}
