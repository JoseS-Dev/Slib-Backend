import { 
  Controller, 
  Get, 
  Post, 
  Body,  
  Param, 
  Delete,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  HttpCode 
} from '@nestjs/common';
import { settings } from '../../../config/settings.config.js';
import { RolePermissionService } from './role-permission.service.js';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto.js';

@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Parámetros de paginación inválidos', HttpStatus.BAD_REQUEST);
    return this.rolePermissionService.findAll(page, limit);
  }

  @Get('role/:roleId')
  @HttpCode(HttpStatus.OK)
  async findAllByRole(
    @Param('roleId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) roleId: number,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Parámetros de paginación inválidos', HttpStatus.BAD_REQUEST);
    return this.rolePermissionService.findAllByRole(roleId, page, limit);
  }


  @Delete('/role/:roleId/permission/:permissionId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('roleId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) roleId: number,
    @Param('permissionId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) permissionId: number
  ) {
    return this.rolePermissionService.remove(roleId, permissionId);
  }
}
