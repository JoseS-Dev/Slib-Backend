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

@Injectable()
export class PhysicalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPhysicalDto: CreatePhysicalDto): Promise<Physical> {
    // Se verifica que no exista una copia con el mismo número de copia para el mismo libro
    const existingCopy = await this.prisma.extended.physicalCopy.findUnique({
      where: { copyNumber: createPhysicalDto.copyNumber },
    });
    if (existingCopy)
      throw new ConflictException(
        'Ya existe una copia con el mismo número de copia para el mismo libro',
      );
    return this.prisma.physicalCopy.create({
      data: createPhysicalDto,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PhysicalCopyStatus,
  ): Promise<{ data: Physical[]; total: number; totalPages: number }> {
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
    return { data: physicalCopies, total, totalPages };
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
    return this.prisma.physicalCopy.update({
      where: { id },
      data: updatePhysicalDto,
    });
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
    return this.prisma.physicalCopy.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica que exista la copia física
    const existingPhysicalCopy = await this.findOne(id);
    if (!existingPhysicalCopy)
      throw new NotFoundException(
        'No se encontró la copia física con el ID proporcionado',
      );
    const deletedPhysicalCopy = await this.prisma.extended.$transaction(
      async (prisma) => {
        // se elimina el libro
        const deletedBook = await this.prisma.extended.book.softDelete(
          existingPhysicalCopy.bookId,
        );
        // se elimina la copia física
        const deletedPhysicalCopy =
          await this.prisma.extended.physicalCopy.softDelete(id);
        return deletedPhysicalCopy;
      },
    );
    if (!deletedPhysicalCopy)
      throw new BadRequestException('No se pudo eliminar la copia física');
    return { message: 'Copia física eliminada correctamente' };
  }
}
