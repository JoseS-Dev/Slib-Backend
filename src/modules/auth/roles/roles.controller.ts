import { 
  Controller, 
  Get, 
  Post,
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe, 
  HttpException
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { settings } from '../../../config/settings.config.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('Administrador')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
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
    return this.rolesService.findAll(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.rolesService.remove(+id);
  }
}
