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
import { RequestService } from './request.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { RequestStatus } from '../../../../generated/prisma/enums.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Usuario', 'Administrador', 'Recepcionista')
  async create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestService.create(createRequestDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
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
    @Query('status') status?: RequestStatus,
  ) {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.requestService.findAll(page, limit, status);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Usuario')
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
    @Query('status') status?: RequestStatus,
  ) {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException(
        'Parámetros de paginación invalidos',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.requestService.findAllByUser(userId, page, limit, status);
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
    return this.requestService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async updateStatus(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestService.changeStatus(+id, updateRequestDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestService.update(+id, updateRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return this.requestService.remove(+id);
  }
}
