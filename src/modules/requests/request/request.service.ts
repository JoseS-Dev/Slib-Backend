import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from './entities/request.entity.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { RequestStatus } from '../../../../generated/prisma/enums.js';
import { RecordRequestStatus } from '../../../utils/constants/constant.js';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRequestDto: CreateRequestDto) : Promise<Request> {
    // Se verifica que exista el usuario y el libro que esta solicitado
    const [existingUser, existingBook] = await Promise.all([
      this.prisma.extended.user.findUnique({
        where: { id: createRequestDto.userId },
      }),
      this.prisma.extended.book.findUnique({
        where: { id: createRequestDto.bookId },
      }),
    ]);
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el ID proporcionado');
    if(!existingBook) throw new NotFoundException('No se encontró el libro con el ID proporcionado');
    // Si existe, se crea la solicitud
    return this.prisma.request.create({
      data: createRequestDto
    });
  }

  async findAll(page: number = 1, limit: number = 10, status?: RequestStatus) : Promise<{data: Request[], total: number, totalPages: number}> {
    const [requests, total] = await Promise.all([
      this.prisma.extended.request.findMany({
        where: {...(status ? { status } : {})},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          user: true,
          book: true,
        }
      }),
      this.prisma.extended.request.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: requests, total, totalPages };
  }

  async findAllByUser(userId: number, page: number = 1, limit: number = 10, status?: RequestStatus) : Promise<{data: Request[], total: number, totalPages: number}> {
    // Se verifica que exista el usuario
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { id: userId },
    });
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el ID proporcionado');
    const [requests, total] = await Promise.all([
      this.prisma.extended.request.findMany({
        where: { userId, ... (status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          user: true,
          book: true,
        }
      }),
      this.prisma.extended.request.count({
        where: { userId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: requests, total, totalPages };
  }

  async findAllByBook(bookId: number, page: number = 1, limit: number = 10, status?: RequestStatus) : Promise<{data: Request[], total: number, totalPages: number}> {
    // Se verifica que exista el libro
    const existingBook = await this.prisma.extended.book.findUnique({
      where: { id: bookId },
    });
    if(!existingBook) throw new NotFoundException('No se encontró el libro con el ID proporcionado');
    const [requests, total] = await Promise.all([
      this.prisma.extended.request.findMany({
        where: { bookId, ... (status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          user: true,
          book: true,
        }
      }),
      this.prisma.extended.request.count({
        where: { bookId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: requests, total, totalPages };
  }

  async findOne(id: number) : Promise<Request> {
    const request = await this.prisma.extended.request.findUnique({
      where: { id },
      include: {
        user: true,
        book: true,
      }
    });
    if(!request) throw new NotFoundException('No se encontró la solicitud con el ID proporcionado');
    return request;
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) : Promise<Request> {
    // Se verifica que exista la solicitud
    const existingRequest = await this.findOne(id);
    if(!existingRequest) throw new NotFoundException('No se encontró la solicitud con el ID proporcionado');
    // Si se va a cambiar el libro, se verifica que exista el libro
    if(updateRequestDto.bookId && updateRequestDto.bookId !== existingRequest.bookId) {
      const existingBook = await this.prisma.extended.book.findUnique({
        where: { id: updateRequestDto.bookId },
      });
      if(!existingBook) throw new NotFoundException('No se encontró el libro con el ID proporcionado');
    }
    return this.prisma.request.update({
      where: { id },
      data: updateRequestDto
    });
  }

  async changeStatus(id: number, data: UpdateRequestDto) : Promise<Request> {
    // Se verifica que exista la solicitud
    const existingRequest = await this.findOne(id);
    if(!existingRequest) throw new NotFoundException('No se encontró la solicitud con el ID proporcionado');
    const currentStatus = existingRequest.status;
    const newStatus = data.status;

    // Se valida si la solicitud ya está en un estado de Cancelada
    if (RecordRequestStatus['Cancelada']?.includes(currentStatus)) {
      throw new BadRequestException('No se puede cambiar el estado de una solicitud que ya está cancelada.');
    }

    // Se valida que si el estado es Cancelada, obligatoriamente existe una razón
    if (newStatus === RecordRequestStatus['Cancelada']) {
      if (!data.reasonCancellation || data.reasonCancellation.trim() === '') {
        throw new BadRequestException('Debe proporcionar una razón de cancelación válida para este cambio de estado.');
      }
    }

    const updatedData: any = {
      status: newStatus,
      reasonCancellation: newStatus === RecordRequestStatus['Cancelada'] 
      ? data.reasonCancellation : null,
    }

    return this.prisma.request.update({
      where: { id },
      data: updatedData
    });
  
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que exista la solicitud
    const existingRequest = await this.findOne(id);
    if(!existingRequest) throw new NotFoundException('No se encontró la solicitud con el ID proporcionado');
    // Si existe, se elimina la solicitud
    const deletedRequest = await this.prisma.request.delete({
      where: { id }
    });
    if(!deletedRequest) throw new BadRequestException('No se pudo eliminar la solicitud');
    return { message: 'Solicitud eliminada correctamente' };
  }
}
