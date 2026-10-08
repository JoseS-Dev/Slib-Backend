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
  HttpException 
} from '@nestjs/common';
import { settings } from '../../../config/settings.config.js';
import { BookAuthorService } from './book-author.service.js';
import { CreateBookAuthorDto } from './dto/create-book-author.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@Controller('book-author')
export class BookAuthorController {
  constructor(private readonly bookAuthorService: BookAuthorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista')
  async create(@Body() createBookAuthorDto: CreateBookAuthorDto) {
    return this.bookAuthorService.create(createBookAuthorDto);
  }

  @Get('book/:bookId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  async findAllByBook(
    @Param('bookId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) bookId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Parámetros de paginación invalidos', HttpStatus.BAD_REQUEST);
    }
    return this.bookAuthorService.findAllByBook(bookId, page, limit);
  }

  @Get('author/:authorId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  async findAllByAuthor(
    @Param('authorId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) authorId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Parámetros de paginación invalidos', HttpStatus.BAD_REQUEST);
    }
    return this.bookAuthorService.findAllByAuthor(authorId, page, limit);
  }

  @Delete('/book/:bookId/author/:authorId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async remove(
    @Param('bookId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) bookId: number,
    @Param('authorId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) authorId: number
  ) {
    return this.bookAuthorService.remove(bookId, authorId);
  }
}
