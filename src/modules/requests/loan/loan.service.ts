import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Loan } from './entities/loan.entity.js';
import { CreateLoanDto } from './dto/create-loan.dto.js';
import { UpdateLoanDto } from './dto/update-loan.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { LoanStatus } from '../../../../generated/prisma/enums.js';
import { RecordLoanStatus } from '../../../utils/constants/constant.js';

@Injectable()
export class LoanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    // Se verifica que el item exista, el ejemplar fisico y recepcionista en cuestión
    const [existingItem, existingPhysicalCopy, existingRecepcionist] =
      await Promise.all([
        this.prisma.requestItem.findUnique({
          where: { id: createLoanDto.requestItemId },
        }),
        this.prisma.extended.physicalCopy.findUnique({
          where: { id: createLoanDto.physicalCopyId },
        }),
        this.prisma.extended.user.findUnique({
          where: {
            id: createLoanDto.recepcionistId,
            role: { name: 'Recepcionista' },
          },
        }),
      ]);
    if (!existingItem)
      throw new NotFoundException(
        'No se encontró el item de solicitud especificado',
      );
    if (!existingPhysicalCopy)
      throw new NotFoundException(
        'No se encontró el ejemplar físico especificado',
      );
    if (!existingRecepcionist)
      throw new NotFoundException(
        'No se encontró el recepcionista especificado',
      );
    return this.prisma.loan.create({
      data: createLoanDto,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: LoanStatus,
  ): Promise<{ data: Loan[]; total: number; totalPages: number }> {
    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        where: { ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { loanDate: 'desc' },
        include: {
          item: true,
          physicalCopy: true,
        },
      }),
      this.prisma.loan.count({
        where: { ...(status ? { status } : {}) },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: loans, total, totalPages };
  }

  async findOne(id: number): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        item: true,
        physicalCopy: true,
      },
    });
    if (!loan)
      throw new NotFoundException('No se encontró el préstamo especificado');
    return loan;
  }

  async update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    // Se verifica que el préstamo exista
    const existingLoan = await this.findOne(id);
    if (!existingLoan)
      throw new NotFoundException('No se encontró el préstamo especificado');
    const updatedLoan = await this.prisma.loan.update({
      where: { id },
      data: updateLoanDto,
    });
    return updatedLoan;
  }

  async changeStatus(id: number, newStatus: LoanStatus): Promise<Loan> {
    // Se verifica que el préstamo exista
    const existingLoan = await this.findOne(id);
    if (!existingLoan)
      throw new NotFoundException('No se encontró el préstamo especificado');
    // Se verifica que el nuevo estado sea válido según el estado actual
    const currentStatus = existingLoan.status;
    if (currentStatus === newStatus) {
      throw new BadRequestException(
        'El estado actual y el nuevo estado son iguales',
      );
    }
    const allowedStatuses = RecordLoanStatus[currentStatus];
    if (!allowedStatuses?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`,
      );
    }
    const updatedLoan = await this.prisma.loan.update({
      where: { id },
      data: { status: newStatus },
    });
    return updatedLoan;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica que el préstamo exista
    const existingLoan = await this.findOne(id);
    // Si el prestamo tiene un estado de activo, no se puede eliminar
    if (existingLoan.status === LoanStatus.Activo) {
      throw new BadRequestException(
        'No se puede eliminar un préstamo con estado Activo',
      );
    }
    if (!existingLoan)
      throw new NotFoundException('No se encontró el préstamo especificado');
    const deletedLoan = await this.prisma.loan.delete({
      where: { id },
    });
    if (!deletedLoan)
      throw new BadRequestException('No se pudo eliminar el préstamo');
    return { message: 'Préstamo eliminado correctamente' };
  }
}
