import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from './entities/request.entity.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { RequestStatus } from '../../../../generated/prisma/enums.js';
import { RecordRequestStatus } from '../../../utils/constants/constant.js';
import { NotificationService } from '../../general/notification/notification.service.js';

@Injectable()
export class RequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    // Se verifica que exista el usuario y el libro que esta solicitado
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { id: createRequestDto.userId },
    });
    if (!existingUser)
      throw new NotFoundException(
        'No se encontró el usuario con el ID proporcionado',
      );
    // Si existe, se crea la solicitud
    const newRequest = await this.prisma.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: {
          userId: createRequestDto.userId,
          titleRequest: createRequestDto.titleRequest,
          descriptionRequest: createRequestDto.descriptionRequest,
          items: {
            create: createRequestDto.items!.map((item) => ({
              physicalCopyId: item.physicalCopyId,
            })),
          },
        },
        include: {
          user: true,
          items: true,
        },
      });

      return request;
    });
    if (!newRequest)
      throw new BadRequestException('No se pudo crear la solicitud');
    // Se le notifica a los recpeccionista de la creación de una solicitud de un libro
    const receptionists = await this.prisma.user.findMany({
      where: { role: { name: 'Recepcionista' } },
    });
    for (const receptionist of receptionists) {
      await this.notificationService.create({
        userId: receptionist.id,
        title: 'Nueva solicitud',
        message: `El usuario ${existingUser.firstName} ${existingUser.lastName} ha creado una nueva solicitud con ID: ${newRequest.id}`,
        typeNotification: 'Informativa',
      });
    }
    return newRequest;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: RequestStatus,
  ): Promise<{
    data: Request[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where: { ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          user: true,
          items: true,
        },
      }),
      this.prisma.request.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: requests, total, page, limit, totalPages };
  }

  async findAllByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: RequestStatus,
  ): Promise<{
    data: Request[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Se verifica que exista el usuario
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser)
      throw new NotFoundException(
        'No se encontró el usuario con el ID proporcionado',
      );
    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where: { userId, ...(status ? { status } : {}) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          user: true,
          items: true,
        },
      }),
      this.prisma.request.count({
        where: { userId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: requests, total, page, limit, totalPages };
  }

  async findOne(id: number): Promise<Request> {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
      },
    });
    if (!request)
      throw new NotFoundException(
        'No se encontró la solicitud con el ID proporcionado',
      );
    return request;
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Request> {
    // Se verifica que exista la solicitud
    const existingRequest = await this.findOne(id);
    if (!existingRequest)
      throw new NotFoundException(
        'No se encontró la solicitud con el ID proporcionado',
      );
    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const request = await tx.request.update({
        where: { id },
        data: {
          titleRequest:
            updateRequestDto.titleRequest ?? existingRequest.titleRequest,
          descriptionRequest:
            updateRequestDto.descriptionRequest ??
            existingRequest.descriptionRequest,
          requestDate:
            updateRequestDto.requestDate ?? existingRequest.requestDate,
          items: updateRequestDto.items
            ? {
                create: updateRequestDto.items.map((item) => ({
                  physicalCopyId: item.physicalCopyId,
                })),
              }
            : undefined,
        },
        include: {
          user: true,
          items: true,
        },
      });
      return request;
    });
    if (!updatedRequest)
      throw new BadRequestException('No se pudo actualizar la solicitud');
    // Se le notifica a los recepcionistas de la actualización de una solicitud
    const receptionists = await this.prisma.user.findMany({
      where: { role: { name: 'Recepcionista' } },
    });
    for (const receptionist of receptionists) {
      await this.notificationService.create({
        userId: receptionist.id,
        title: 'Solicitud actualizada',
        message: `El usuario ${existingRequest.user!.firstName} ${existingRequest.user!.lastName} ha actualizado su solicitud con ID: ${updatedRequest.id}`,
        typeNotification: 'Informativa',
      });
    }
    return updatedRequest;
  }

  async changeStatus(id: number, data: UpdateRequestDto): Promise<Request> {
    // Se verifica que exista la solicitud
    const existingRequest = await this.findOne(id);
    if (!existingRequest)
      throw new NotFoundException(
        'No se encontró la solicitud con el ID proporcionado',
      );
    const currentStatus = existingRequest.status;
    const newStatus = data.status;

    if (!newStatus) {
      throw new BadRequestException(
        'Debe proporcionar el nuevo estado de la solicitud.',
      );
    }

    // No se permiten cambios si ya está cancelada (estado terminal).
    if (currentStatus === RequestStatus.Cancelada) {
      throw new BadRequestException(
        'No se puede cambiar el estado de una solicitud que ya está cancelada.',
      );
    }

    // Validar la transición de estado contra la matriz RecordRequestStatus.
    const allowedNext = RecordRequestStatus[currentStatus] ?? [];
    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}.`,
      );
    }

    // Si el destino es Cancelada, la razón es obligatoria y no puede estar vacía.
    if (newStatus === RequestStatus.Cancelada) {
      if (
        !data.reasonCancellation ||
        data.reasonCancellation.trim() === ''
      ) {
        throw new BadRequestException(
          'Debe proporcionar una razón de cancelación válida para este cambio de estado.',
        );
      }
    }

    const updatedData = {
      status: newStatus,
      reasonCancellation:
        newStatus === RequestStatus.Cancelada
          ? (data.reasonCancellation ?? null)
          : null,
    };

    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: updatedData,
    });
    if(!updatedRequest) throw new BadRequestException('No se pudo actualizar el estado de la solicitud');
    // Se le notifica a los recepcionistas y al usuario que hubo un cambio de estado en la solicitud
    const receptionists = await this.prisma.user.findMany({
      where: { role: { name: 'Recepcionista' } },
    });
    for (const receptionist of receptionists) {
      await this.notificationService.create({
        userId: receptionist.id,
        title: 'Estado de solicitud actualizado',
        message: `El usuario ${existingRequest.user!.firstName} ${existingRequest.user!.lastName} ha cambiado el estado de su solicitud con ID: ${updatedRequest.id} a ${newStatus}`,
        typeNotification: 'Informativa',
      });
    }
    await this.notificationService.create({
      userId: existingRequest.userId,
      title: 'Estado de solicitud actualizado',
      message: `Su solicitud con ID: ${updatedRequest.id} ha cambiado de estado a ${newStatus}`,
      typeNotification: 'Informativa',
    });
    return updatedRequest;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica que exista la solicitud
    const existingRequest = await this.findOne(id);
    if (!existingRequest)
      throw new NotFoundException(
        'No se encontró la solicitud con el ID proporcionado',
      );
    // Si existe, se elimina la solicitud
    const deletedRequest = await this.prisma.$transaction(async (tx) => {
      // Se elimina los items asociados a la solicitud
      await tx.requestItem.deleteMany({
        where: { requestId: id },
      });
      // Se elimina la solicitud
      const request = await tx.request.delete({
        where: { id },
      });
      return request;
    });
    if (!deletedRequest)
      throw new BadRequestException('No se pudo eliminar la solicitud');
    // Se le notifica a los recepcionistas de la eliminación de una solicitud
    const receptionists = await this.prisma.user.findMany({
      where: { role: { name: 'Recepcionista' } },
    });
    for (const receptionist of receptionists) {
      await this.notificationService.create({
        userId: receptionist.id,
        title: 'Solicitud eliminada',
        message: `La solicitud con ID: ${id} ha sido eliminada`,
        typeNotification: 'Informativa',
      });
    }
    return { message: 'Solicitud eliminada correctamente' };
  }
}
