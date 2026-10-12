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
import { NotificationService } from '../../general/notification/notification.service.js';

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) {}

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
    const createdLoan = await this.prisma.loan.create({
      data: createLoanDto,
    });
    if(!createdLoan)
      throw new BadRequestException('No se pudo crear el préstamo');
    // Se cambia el estado del ejemplar físico a Prestado
    await this.prisma.physicalCopy.update({
      where: { id: createLoanDto.physicalCopyId },
      data: { status: 'Prestado' },
    });
    // Se le notifica al recepcionista que ha creado un préstamo
    await this.notificationService.create({
      userId: createLoanDto.recepcionistId,
      title: 'Préstamo creado',
      message: `Se ha creado un préstamo para el item de solicitud con ID: ${createLoanDto.requestItemId} y el ejemplar físico con ID: ${createLoanDto.physicalCopyId}`,
      typeNotification: 'Informativa'
    })
    return createdLoan;
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
    // Se le notifica al recepcionista que ha actualizado un préstamo
    await this.notificationService.create({
      userId: updatedLoan.recepcionistId,
      title: 'Préstamo actualizado',
      message: `Se ha actualizado el préstamo con ID: ${updatedLoan.id}`,
      typeNotification: 'Informativa'
    })
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
    // Se le notifica al recepcionista que ha cambiado el estado de un préstamo
    await this.notificationService.create({
      userId: updatedLoan.recepcionistId,
      title: 'Estado de préstamo actualizado',
      message: `Se ha actualizado el estado del préstamo con ID: ${updatedLoan.id} a ${newStatus}`,
      typeNotification: 'Informativa'
    })
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
    // Se notifica a los recepcionistas y adminsitradores la eliminación de un prestamo
    const users = await this.prisma.extended.user.findMany({
      where: { role: { name: { in: ['Administrador', 'Recepcionista'] } } },
    });
    for (const user of users) {
      await this.notificationService.create({
        userId: user.id,
        title: 'Préstamo eliminado',
        message: `Se ha eliminado el préstamo con ID: ${deletedLoan.id}`,
        typeNotification: 'Informativa',
      });
    }
    return { message: 'Préstamo eliminado correctamente' };
  }
}
