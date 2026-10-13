import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Param,
  Delete,
  Headers,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookService } from './book.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { StorageService } from '../../../config/storages/storage/storage.service.js';
import { MulterInterceptor } from '../../../config/storages/storage/multer.inteceptor.js';
import {
  BookDeleteResponse,
  BookErrorResponse,
  BookResponse,
  PaginatedBooksResponse,
} from './dto/book-response.dto.js';

@ApiTags('Libros')
@ApiBearerAuth('JWT')
@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(MulterInterceptor)
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Crear un nuevo libro',
    description:
      'Crea un libro en el catálogo. Permite subir una portada opcional mediante multipart/form-data. Si se envía un archivo, también debe enviarse el header `x-upload` con la subcarpeta destino.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiHeader({
    name: 'x-upload',
    required: false,
    description: 'Subcarpeta destino de la portada (requerido si se sube archivo)',
    example: 'books',
  })
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Libro creado exitosamente',
    type: BookResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: BookErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la categoría, subcategoría o editorial',
    type: BookErrorResponse,
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
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-upload') folder: string,
  ): Promise<BookResponse> {
    if (file) {
      const data = {
        ...createBookDto,
        frontCoverUrl: this.storageService.getRelativeFilePathInSubfolder(
          folder,
          file.filename,
        ),
        mimeType: file.mimetype,
        fileSize: file.size,
      };
      return this.bookService.create(data);
    }
    return this.bookService.create(createBookDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar todos los libros',
    description:
      'Obtiene el listado paginado de libros del catálogo, ordenados por fecha de creación. Incluye categoría, subcategoría y editorial.',
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
    description: 'Listado paginado de libros',
    type: PaginatedBooksResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: BookErrorResponse,
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
  ): Promise<PaginatedBooksResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.bookService.findAll(page, limit);
  }

  @Get('category/:categoryId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar libros por categoría',
    description: 'Obtiene el listado paginado de libros de una categoría específica.',
  })
  @ApiParam({
    name: 'categoryId',
    type: Number,
    example: 2,
    description: 'Identificador de la categoría',
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
    description: 'Listado paginado de libros de la categoría',
    type: PaginatedBooksResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: BookErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByCategory(
    @Param('categoryId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) categoryId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ): Promise<PaginatedBooksResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.bookService.findAllByCategory(categoryId, page, limit);
  }

  @Get('subcategory/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar libros por subcategoría',
    description: 'Obtiene el listado paginado de libros de una subcategoría específica.',
  })
  @ApiParam({
    name: 'subcategoryId',
    type: Number,
    example: 5,
    description: 'Identificador de la subcategoría',
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
    description: 'Listado paginado de libros de la subcategoría',
    type: PaginatedBooksResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: BookErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllBySubcategory(
    @Param('subcategoryId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) subcategoryId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ): Promise<PaginatedBooksResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.bookService.findAllBySubcategory(subcategoryId, page, limit);
  }

  @Get('publisher/:publisherId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar libros por editorial',
    description: 'Obtiene el listado paginado de libros publicados por una editorial específica.',
  })
  @ApiParam({
    name: 'publisherId',
    type: Number,
    example: 3,
    description: 'Identificador de la editorial',
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
    description: 'Listado paginado de libros de la editorial',
    type: PaginatedBooksResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: BookErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAllByPublisher(
    @Param('publisherId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) publisherId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ): Promise<PaginatedBooksResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos',
        HttpStatus.BAD_REQUEST,
      );
    return this.bookService.findAllByPublisher(publisherId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener un libro por su identificador',
    description: 'Devuelve un libro con los datos de categoría, subcategoría y editorial.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del libro',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Libro encontrado',
    type: BookResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: BookErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el libro solicitado',
    type: BookErrorResponse,
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
  ): Promise<BookResponse> {
    return this.bookService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(MulterInterceptor)
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  @ApiOperation({
    summary: 'Actualizar un libro existente',
    description:
      'Permite modificar los datos de un libro. Permite subir una nueva portada opcional mediante multipart/form-data. Si se envía un archivo, también debe enviarse el header `x-upload` con la subcarpeta destino. La portada anterior se elimina automáticamente.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiHeader({
    name: 'x-upload',
    required: false,
    description: 'Subcarpeta destino de la portada (requerido si se sube archivo)',
    example: 'books',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del libro',
  })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Libro actualizado exitosamente',
    type: BookResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
    type: BookErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el libro, la categoría, subcategoría o editorial',
    type: BookErrorResponse,
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
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-upload') folder: string,
  ): Promise<BookResponse> {
    if (file) {
      const data = {
        ...updateBookDto,
        frontCoverUrl: this.storageService.getRelativeFilePathInSubfolder(
          folder,
          file.filename,
        ),
        mimeType: file.mimetype,
        fileSize: file.size,
      };
      return this.bookService.update(+id, data);
    }
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Eliminar un libro',
    description: 'Realiza un soft delete del libro y elimina su portada del almacenamiento.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único del libro a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Libro eliminado correctamente',
    type: BookDeleteResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró el libro',
    type: BookErrorResponse,
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
  ): Promise<BookDeleteResponse> {
    return this.bookService.remove(+id);
  }
}
