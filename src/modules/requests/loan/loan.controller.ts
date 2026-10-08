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
  HttpException 
} from '@nestjs/common';
import { LoanService } from './loan.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateLoanDto } from './dto/create-loan.dto.js';
import { UpdateLoanDto } from './dto/update-loan.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { LoanStatus } from '../../../../generated/prisma/enums.js';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Recepcionista', 'Administrador')
  async create(@Body() createLoanDto: CreateLoanDto) {
    return this.loanService.create(createLoanDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async findAll(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) limit: number = 10,
    @Query('status') status?: LoanStatus
  ) {
    if(page < 1 || limit < 1 || limit > settings.server.maxPagination) {
      throw new HttpException('Parámetros de paginación invalidos', HttpStatus.BAD_REQUEST);
    }
    return this.loanService.findAll(page, limit, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.loanService.findOne(+id);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async changeStatus(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body('newStatus') newStatus: LoanStatus
  ) {
    return this.loanService.changeStatus(+id, newStatus);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Recepcionista', 'Administrador')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loanService.update(+id, updateLoanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  async remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string) {
    return this.loanService.remove(+id);
  }
}
