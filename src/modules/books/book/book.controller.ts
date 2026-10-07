import { 
  Controller,
  Res, 
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
  HttpException 
} from '@nestjs/common';
import { BookService } from './book.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { StorageService } from '../../../config/storages/storage/storage.service.js';
import { MulterInterceptor } from '../../../config/storages/storage/multer.inteceptor.js';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly storageService: StorageService
  ) {}

  @Post()
  @UseInterceptors(MulterInterceptor)
  @HttpCode(HttpStatus.CREATED)
  @Roles("Administrador")
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-upload') folder: string
  ) {
    if(file){
      const data = {
        ...createBookDto,
        icon: this.storageService.getRelativeFilePathInSubfolder(
          folder,
          file.filename
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
  @Roles("Administrador", "Recepcionista", "Usuario")
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Los parámetros de paginación son inválidos', HttpStatus.BAD_REQUEST);
    return this.bookService.findAll(page, limit);
  }

  @Get('category/:categoryId')
  @HttpCode(HttpStatus.OK)
  @Roles("Administrador", "Recepcionista", "Usuario")
  async findAllByCategory(
    @Param('categoryId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) categoryId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Los parámetros de paginación son inválidos', HttpStatus.BAD_REQUEST);
    return this.bookService.findAllByCategory(categoryId, page, limit);
  }

  @Get('subcategory/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  @Roles("Administrador", "Recepcionista", "Usuario")
  async findAllBySubcategory(
    @Param('subcategoryId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) subcategoryId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Los parámetros de paginación son inválidos', HttpStatus.BAD_REQUEST);
    return this.bookService.findAllBySubcategory(subcategoryId, page, limit);
  }

  @Get('publisher/:publisherId')
  @HttpCode(HttpStatus.OK)
  @Roles("Administrador", "Recepcionista", "Usuario")
  async findAllByPublisher(
    @Param('publisherId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) publisherId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Los parámetros de paginación son inválidos', HttpStatus.BAD_REQUEST);
    return this.bookService.findAllByPublisher(publisherId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles("Administrador", "Recepcionista", "Usuario")
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.bookService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(MulterInterceptor)
  @HttpCode(HttpStatus.OK)
  @Roles("Administrador", "Recepcionista")
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() 
    updateBookDto: UpdateBookDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-upload') folder: string
  ) {
    if(file){
      const data = {
        ...updateBookDto,
        icon: this.storageService.getRelativeFilePathInSubfolder(
          folder,
          file.filename
        ),
        mimeType: file.mimetype,
        fileSize: file.size,
      }
      return this.bookService.update(+id, data);
    }
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles("Administrador")
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.bookService.remove(+id);
  }
}
