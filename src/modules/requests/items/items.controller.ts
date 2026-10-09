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
import { ItemsService } from './items.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { settings } from '../../../config/settings.config.js'
import { Roles } from '../../../common/decorators/roles.decorator.js';


@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Usuario')
  async create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get('request/:requestId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  async findAll(
    @Param('requestId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) requestId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination){
      throw new HttpException('Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.', HttpStatus.BAD_REQUEST);
    }
    return this.itemsService.findAll(requestId, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.itemsService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Recepcionista', 'Administrador')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(+id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario', 'Administrador')
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.itemsService.remove(+id);
  }
}
