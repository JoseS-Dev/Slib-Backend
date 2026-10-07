import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
  HttpException 
} from '@nestjs/common';
import { settings } from '../../../config/settings.config.js';
import { PermissionsService } from './permissions.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination) 
      throw new HttpException('Parámetros de paginación inválidos', HttpStatus.BAD_REQUEST);
    return this.permissionsService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.permissionsService.remove(+id);
  }
}
