import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Suspension } from './entities/suspension.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateSuspensionDto } from './dto/create-suspension.dto.js';
import { UpdateSuspensionDto } from './dto/update-suspension.dto.js';
import { SuspensionStatus } from '../../../../generated/prisma/enums.js';
import { RecordSuspensionStatus } from '../../../utils/constants/constant.js';

@Injectable()
export class SuspensionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSuspensionDto: CreateSuspensionDto) : Promise<Suspension> {
    // Se verifica que exista el usuario y la multa
    const validations: Promise<any>[] = [];
    if(createSuspensionDto.userId){
      validations.push(this.prisma.extended.user.findUnique({
        where: { id: createSuspensionDto.userId },
      }).then(user => {
        if(!user) throw new NotFoundException('No se encontró el usuario con el id proporcionado.');
      }))
    }
    if(createSuspensionDto.fineId){
      validations.push(this.prisma.fine.findUnique({
        where: { id: createSuspensionDto.fineId },
      }).then(fine => {
        if(!fine) throw new NotFoundException('No se encontró la multa con el id proporcionado.');
      }))
    }
    await Promise.all(validations);
    // Si existe, se crea la suspensión
    const newSuspension = await this.prisma.suspension.create({
      data: createSuspensionDto
    });
    if(!newSuspension) throw new BadRequestException('No se pudo crear la suspensión.');
    return newSuspension;
  }

  async findAll(page: number = 1, limit: number = 10, status?: SuspensionStatus) {
    const [suspensions, total] = await Promise.all([
      this.prisma.extended.suspension.findMany({
        where: { ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          user: true,
          fine: true,
        }
      }),
      this.prisma.extended.suspension.count({
        where: { ...(status ? { status } : {}) },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: suspensions, total, totalPages };
  }

  async findAllByUser(userId: number, page: number = 1, limit: number = 10, status?: SuspensionStatus) {
    // Se verifica que exista el usuario
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { id: userId },
    });
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el id proporcionado.');
    const [suspensions, total] = await Promise.all([
      this.prisma.extended.suspension.findMany({
        where: { userId, ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          user: true,
          fine: true,
        }
      }),
      this.prisma.extended.suspension.count({
        where: { userId, ...(status ? { status } : {}) },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: suspensions, total, totalPages };
  }

  async findOne(id: number) : Promise<Suspension> {
    const suspension = await this.prisma.extended.suspension.findUnique({
      where: { id },
      include: {
        user: true,
        fine: true,
      }
    });
    if(!suspension) throw new NotFoundException('No se encontró la suspensión con el id proporcionado.');
    return suspension;
  }

  async update(id: number, updateSuspensionDto: UpdateSuspensionDto) {
    // Se verifica que exista la suspensión
    const existingSuspension = await this.findOne(id);
    if(!existingSuspension) throw new NotFoundException('No se encontró la suspensión con el id proporcionado.');
    // Si se va actualizar la fecha de finalización, se valida que sea mayor a la fecha de comienzo de suspensión
    if(updateSuspensionDto.endDate && updateSuspensionDto.endDate <= existingSuspension.startDate){
      throw new BadRequestException('La fecha de finalización de la suspensión debe ser mayor a la fecha de comienzo de la suspensión.');
    }
    // Se actualiza la suspensión
    const updatedSuspension = await this.prisma.suspension.update({
      where: { id },
      data: updateSuspensionDto,
    });
    if(!updatedSuspension) throw new BadRequestException('No se pudo actualizar la suspensión.');
    return updatedSuspension;
  }

  async changeStatus(id: number, newStatus: SuspensionStatus) {
    // Se verifica que exista la suspensión
    const existingSuspension = await this.findOne(id);
    if(!existingSuspension) throw new NotFoundException('No se encontró la suspensión con el id proporcionado.');
    // Se valida que el nuevo estado sea válido según RecordSuspensionStatus
    const currentStatus = existingSuspension.status;
    if(currentStatus === newStatus){
      throw new BadRequestException(`La suspensión ya tiene el estado ${currentStatus}.`);
    }
    const allowedStatuses = RecordSuspensionStatus[currentStatus];
    if(!allowedStatuses?.includes(newStatus)){
      throw new BadRequestException(`El estado ${newStatus} no es válido para la suspensión con estado actual ${currentStatus}.`);
    }
    // Se actualiza el estado de la suspensión
    const updatedSuspension = await this.prisma.suspension.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });
    if(!updatedSuspension) throw new BadRequestException('No se pudo actualizar el estado de la suspensión.');
    return updatedSuspension;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que exista la suspensión
    const existingSuspension = await this.findOne(id);
    if(!existingSuspension) throw new NotFoundException('No se encontró la suspensión con el id proporcionado.');
    // Se elimina la suspensión
    const deletedSuspension = await this.prisma.extended.suspension.softDelete(id)
    if(!deletedSuspension) throw new BadRequestException('No se pudo eliminar la suspensión.');
    return { message: 'Suspensión eliminada correctamente.' };
  }
}
