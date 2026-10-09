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
import { SuspensionService } from './suspension.service.js';
import { settings } from '../../../config/settings.config.js'
import { CreateSuspensionDto } from './dto/create-suspension.dto.js';
import { UpdateSuspensionDto } from './dto/update-suspension.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { SuspensionStatus } from '../../../../generated/prisma/enums.js';

@Controller('suspension')
export class SuspensionController {
  constructor(private readonly suspensionService: SuspensionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Recepcionista', 'Administrador')
  async create(@Body() createSuspensionDto: CreateSuspensionDto) {
    return this.suspensionService.create(createSuspensionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
    @Query('status') status?: SuspensionStatus,
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination){
      throw new HttpException('Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.', HttpStatus.BAD_REQUEST);
    }
    return this.suspensionService.findAll(page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.suspensionService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async changeStatus(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body('newStatus') newStatus: SuspensionStatus,
  ) {
    return this.suspensionService.changeStatus(+id, newStatus);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async update(@Param('id') id: string, @Body() updateSuspensionDto: UpdateSuspensionDto) {
    return this.suspensionService.update(+id, updateSuspensionDto);
  }
  
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async remove(@Param('id') id: string) {
    return this.suspensionService.remove(+id);
  }
}
