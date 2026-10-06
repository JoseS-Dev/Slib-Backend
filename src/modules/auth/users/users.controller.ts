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
  HttpException,
  Query,
  ParseIntPipe 
} from '@nestjs/common';
import { settings } from '../../../config/settings.config.js';
import { UsersService } from './users.service.js';
import { CreateUserDto, CreateAdminUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.usersService.createAdmin(createAdminUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Parámetros de paginación inválidos', HttpStatus.BAD_REQUEST);
    return this.usersService.findAll(page, limit);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  async findAllByActive(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException('Parámetros de paginación inválidos', HttpStatus.BAD_REQUEST);
    return this.usersService.findAllByActive(page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.usersService.changeStatus(+id, isActive);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.usersService.remove(+id);
  }
}
