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
import { PhysicalService } from './physical.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreatePhysicalDto } from './dto/create-physical.dto.js';
import { UpdatePhysicalDto } from './dto/update-physical.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { PhysicalCopyStatus } from '../../../../generated/prisma/enums.js';

@Controller('physical')
export class PhysicalController {
  constructor(private readonly physicalService: PhysicalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista')
  async create(@Body() createPhysicalDto: CreatePhysicalDto) {
    return this.physicalService.create(createPhysicalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
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
    @Query('status') status?: PhysicalCopyStatus,
  ) {
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
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return this.physicalService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async changeStatus(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body('newStatus') newStatus: PhysicalCopyStatus,
  ) {
    return this.physicalService.changeStatus(+id, newStatus);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updatePhysicalDto: UpdatePhysicalDto,
  ) {
    return this.physicalService.update(+id, updatePhysicalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return this.physicalService.remove(+id);
  }
}
