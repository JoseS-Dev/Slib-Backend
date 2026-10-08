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
  HttpException,
  ParseIntPipe 
} from '@nestjs/common';
import { PublisherService } from './publisher.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreatePublisherDto } from './dto/create-publisher.dto.js';
import { UpdatePublisherDto } from './dto/update-publisher.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista')
  async create(@Body() createPublisherDto: CreatePublisherDto) {
    return this.publisherService.create(createPublisherDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Parámetros de paginación invalidos', HttpStatus.BAD_REQUEST);
    }
    return this.publisherService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.publisherService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() updatePublisherDto: UpdatePublisherDto) {
    return this.publisherService.update(+id, updatePublisherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.publisherService.remove(+id);
  }
}
