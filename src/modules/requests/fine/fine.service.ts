import { Injectable, NotFoundException } from '@nestjs/common';
import { Fine } from './entities/fine.entity.js';
import { CreateFineDto } from './dto/create-fine.dto.js';
import { UpdateFineDto } from './dto/update-fine.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { FineStatus } from '../../../../generated/prisma/enums.js';
import { RecordFineStatus } from '../../../utils/constants/constant.js';

@Injectable()
export class FineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFineDto: CreateFineDto) : Promise<Fine> {
    // Se verifica que exista el usuario y el prestamo que este un estado de Vencido
    const [existingUser, existingLoan] = await Promise.all([
      this.prisma.extended.user.findUnique({
        where: { id: createFineDto.userId },
      }),
      this.prisma.loan.findUnique({
        where: { id: createFineDto.loanId, status: 'Vencido' },
      }),
    ]);
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el id proporcionado.');
    if(!existingLoan) throw new NotFoundException('No se encontró el préstamo con el id proporcionado o no está en estado Vencido.');
    // Si existe, se crea la multa
    const newFine = await this.prisma.fine.create({
      data: createFineDto
    });
    if(!newFine) throw new NotFoundException('No se pudo crear la multa.');
    return newFine;
  }

  async findAll(page: number = 1, limit: number = 10, status?: FineStatus) : Promise<{data: Fine[], total: number, totalPages: number}> {
    const [fines, total] = await Promise.all([
      this.prisma.fine.findMany({
        where: { ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          loan: true,
        }
      }),
      this.prisma.fine.count({
        where: { ...(status ? { status } : {}) },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: fines, total, totalPages };
  }

  async findAllByUser(userId: number, page: number = 1, limit: number = 10, status?: FineStatus) : Promise<{data: Fine[], total: number, totalPages: number}> {
    // Se verifica que exista el usuario
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { id: userId },
    });
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el id proporcionado.');
    const [fines, total] = await Promise.all([
      this.prisma.fine.findMany({
        where: { userId, ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          loan: true,
        }
      }),
      this.prisma.fine.count({
        where: { userId, ...(status ? { status } : {}) },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: fines, total, totalPages };
  }

  async findOne(id: number) : Promise<Fine> {
    const fine = await this.prisma.fine.findUnique({
      where: { id },
      include: {
        loan: true,
      }
    });
    if(!fine) throw new NotFoundException('No se encontró la multa con el id proporcionado.');
    return fine;
  }

  async update(id: number, updateFineDto: UpdateFineDto) : Promise<Fine> {
    // Se verifica que exista la multa
    const existingFine = await this.findOne(id);
    if(!existingFine) throw new NotFoundException('No se encontró la multa con el id proporcionado.');
    // Se actualiza la multa
    const updatedFine = await this.prisma.fine.update({
      where: { id },
      data: updateFineDto,
    });
    if(!updatedFine) throw new NotFoundException('No se pudo actualizar la multa.');
    return updatedFine;
  }

  async changeStatus(id: number, data: UpdateFineDto) : Promise<Fine> {
    // Se verifica que exista la multa
    const existingFine = await this.findOne(id);
    if(!existingFine) throw new NotFoundException('No se encontró la multa con el id proporcionado.');
    // Se verifica que el nuevo estado sea válido según RecordFineStatus
    const currentStatus = existingFine.status;
    if(currentStatus === data.status){
      throw new NotFoundException(`La multa ya tiene el estado ${currentStatus}.`);
    }
    const validNextStatuses = RecordFineStatus[currentStatus];
    if(!validNextStatuses?.includes(data.status!)){
      throw new NotFoundException(`El estado ${data.status} no es válido para la multa con estado actual ${currentStatus}.`);
    }
    // Se actualiza el estado de la multa
    const updatedFine = await this.prisma.fine.update({
      where: { id },
      data: {
        status: data.status,
      },
    });
    if(!updatedFine) throw new NotFoundException('No se pudo actualizar el estado de la multa.');
    return updatedFine;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que exista la multa
    const existingFine = await this.findOne(id);
    if(!existingFine) throw new NotFoundException('No se encontró la multa con el id proporcionado.');
    // Se elimina la multa
    const deletedFine = await this.prisma.fine.delete({
      where: { id },
    });
    if(!deletedFine) throw new NotFoundException('No se pudo eliminar la multa.');
    return { message: 'Multa eliminada correctamente.' };
  }
}
