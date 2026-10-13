import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Physical } from './entities/physical.entity.js';
import { CreatePhysicalDto } from './dto/create-physical.dto.js';
import { UpdatePhysicalDto } from './dto/update-physical.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PhysicalCopyStatus } from '../../../../generated/prisma/enums.js';
import { RecordPhysicalCopyStatus } from '../../../utils/constants/constant.js';
import { NotificationService } from '../../general/notification/notification.service.js';

@Injectable()
export class PhysicalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createPhysicalDto: CreatePhysicalDto): Promise<Physical> {
    // Se verifica que no exista una copia con el mismo número de copia para el mismo libro
    const existingCopy = await this.prisma.extended.physicalCopy.findUnique({
      where: { copyNumber: createPhysicalDto.copyNumber },
    });
    if (existingCopy)
      throw new ConflictException(
        'Ya existe una copia con el mismo número de copia para el mismo libro',
      );
    const newPhysicalCopy = await this.prisma.physicalCopy.create({
      data: createPhysicalDto,
    });
    if (!newPhysicalCopy)
      throw new BadRequestException('No se pudo crear la copia física');
    // Se notifica a los usuarios que el libro ha sido recibido y está disponible para préstamo
    const users = await this.prisma.extended.user.findMany({
      where: { role: { name: 'Usuario' } },
    });
    for (const user of users) {
      await this.notificationService.create({
        userId: user.id,
        title: 'Nuevo ejemplar disponible',
        message: `Se ha recibido un nuevo ejemplar del libro con ID: ${newPhysicalCopy.bookId} y número de copia: ${newPhysicalCopy.copyNumber}. Ahora está disponible para préstamo.`,
        typeNotification: 'Informativa',
      });
    }
    return newPhysicalCopy;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PhysicalCopyStatus,
  ): Promise<{
    data: Physical[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [physicalCopies, total] = await Promise.all([
      this.prisma.extended.physicalCopy.findMany({
        where: { ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          book: true,
        },
      }),
      this.prisma.extended.physicalCopy.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: physicalCopies, total, page, limit, totalPages };
  }

  async findOne(id: number): Promise<Physical> {
    const physicalCopy = await this.prisma.extended.physicalCopy.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });
    if (!physicalCopy)
      throw new NotFoundException(
        'No se encontró la copia física con el ID proporcionado',
      );
    return physicalCopy;
  }

  async update(
    id: number,
    updatePhysicalDto: UpdatePhysicalDto,
  ): Promise<Physical> {
    // Se verifica que exista la copia física
    const existingPhysicalCopy = await this.findOne(id);
    if (!existingPhysicalCopy)
      throw new NotFoundException(
        'No se encontró la copia física con el ID proporcionado',
      );
    // Se verifica que no exista otra copia con el mismo número de copia para el mismo libro
    if (
      updatePhysicalDto.copyNumber &&
      updatePhysicalDto.copyNumber !== existingPhysicalCopy.copyNumber
    ) {
      const physicalCopyWithSameCopyNumber =
        await this.prisma.extended.physicalCopy.findUnique({
          where: { copyNumber: updatePhysicalDto.copyNumber },
        });
      if (physicalCopyWithSameCopyNumber)
        throw new ConflictException(
          'Ya existe una copia con el mismo número de copia para el mismo libro',
        );
    }
    const updatedPhysicalCopy = await this.prisma.physicalCopy.update({
      where: { id },
      data: updatePhysicalDto,
    });
    if (!updatedPhysicalCopy)
      throw new BadRequestException('No se pudo actualizar la copia física');
    // Se notifica a los adminsitradores y recepcionista del sistema de la actualización de la copia física
    const users = await this.prisma.extended.user.findMany({
      where: { role: { name: { in: ['Administrador', 'Recepcionista'] } } },
    });
    for (const user of users) {
      await this.notificationService.create({
        userId: user.id,
        title: 'Copia física actualizada',
        message: `Se ha actualizado la copia física con ID: ${updatedPhysicalCopy.id}`,
        typeNotification: 'Informativa',
      });
    }
    return updatedPhysicalCopy;
  }

  async changeStatus(
    id: number,
    newStatus: PhysicalCopyStatus,
  ): Promise<Physical> {
    // Se verifica que exista la copia física
    const existingPhysicalCopy = await this.findOne(id);
    if (!existingPhysicalCopy)
      throw new NotFoundException(
        'No se encontró la copia física con el ID proporcionado',
      );
    // Se verifica que el nuevo estado sea válido según el estado actual
    const currentStatus = existingPhysicalCopy.status;
    if (currentStatus === newStatus)
      throw new BadRequestException(
        'El nuevo estado es el mismo que el estado actual',
      );
    const allowedStatuses = RecordPhysicalCopyStatus[currentStatus];
    if (!allowedStatuses?.includes(newStatus))
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`,
      );
    const updatedPhysicalCopy = await this.prisma.physicalCopy.update({
      where: { id },
      data: { status: newStatus },
    });
    if(!updatedPhysicalCopy)
      throw new BadRequestException('No se pudo actualizar la copia física');
    // Se notifica a los administradores y recepcionista del sistema de la actualización del estado de la copia física
    const users = await this.prisma.extended.user.findMany({
      where: { role: { name: { in: ['Administrador', 'Recepcionista'] } } },
    });
    for (const user of users) {
      await this.notificationService.create({
        userId: user.id,
        title: 'Estado de copia física actualizado',
        message: `Se ha actualizado el estado de la copia física con ID: ${updatedPhysicalCopy.id} a ${newStatus}`,
        typeNotification: 'Informativa',
      });
    }
    return updatedPhysicalCopy;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica que exista la copia física
    const existingPhysicalCopy = await this.findOne(id);
    if (!existingPhysicalCopy)
      throw new NotFoundException(
        'No se encontró la copia física con el ID proporcionado',
      );
    const deletedPhysicalCopy = await this.prisma.extended.$transaction(
      async (tx) => {
        // se elimina el libro
        const deletedBook = await tx.book.softDelete(
          existingPhysicalCopy.bookId,
        );
        // se elimina la copia física
        const deletedPhysicalCopy =
          await tx.physicalCopy.softDelete(id);
        return deletedPhysicalCopy;
      },
    );
    if (!deletedPhysicalCopy)
      throw new BadRequestException('No se pudo eliminar la copia física');
    // Se notifica a los administradores y recepcionista del sistema de la eliminación de la copia física
    const users = await this.prisma.extended.user.findMany({
      where: { role: { name: { in: ['Administrador', 'Recepcionista'] } } },
    });
    for (const user of users) {
      await this.notificationService.create({
        userId: user.id,
        title: 'Copia física eliminada',
        message: `Se ha eliminado la copia física con ID: ${deletedPhysicalCopy.id}`,
        typeNotification: 'Informativa',
      });
    }
    return { message: 'Copia física eliminada correctamente' };
  }
}
