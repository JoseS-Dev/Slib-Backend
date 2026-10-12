import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Publisher } from './entities/publisher.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreatePublisherDto } from './dto/create-publisher.dto.js';
import { UpdatePublisherDto } from './dto/update-publisher.dto.js';
import { NotificationService } from '../../general/notification/notification.service.js';

@Injectable()
export class PublisherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    // Se verifica que no exista un publisher con el mismo nombre
    const existingPublisher = await this.prisma.extended.publisher.findUnique({
      where: { name: createPublisherDto.name },
    });
    if (existingPublisher)
      throw new ConflictException('Ya existe un publisher con el mismo nombre');
    const createdPublisher = await this.prisma.publisher.create({
      data: createPublisherDto,
    });
    if(!createdPublisher)
      throw new BadRequestException('No se pudo crear el publisher');
    // Se notifica a los administradores del sistema sobre la creación del nuevo publisher
    const admins = await this.prisma.extended.user.findMany({
      where: { role: { name: 'Administrador' } },
    });
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        title: 'Publisher creado',
        message: `Se ha creado un nuevo publisher con ID: ${createdPublisher.id}`,
        typeNotification: 'Informativa',
      });
    }

    return createdPublisher;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Publisher[]; total: number; totalPages: number }> {
    const [publishers, total] = await Promise.all([
      this.prisma.extended.publisher.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          books: true,
        },
      }),
      this.prisma.extended.publisher.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: publishers, total, totalPages };
  }

  async findOne(id: number): Promise<Publisher> {
    const publisher = await this.prisma.extended.publisher.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });
    if (!publisher)
      throw new NotFoundException(
        'No se encontró el publisher con el ID proporcionado',
      );
    return publisher;
  }

  async update(
    id: number,
    updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    // Se verifica que exista el publisher
    const existingPublisher = await this.findOne(id);
    if (!existingPublisher)
      throw new NotFoundException(
        'No se encontró el publisher con el ID proporcionado',
      );
    // Se verifica que no exista otro publisher con el mismo nombre
    if (
      updatePublisherDto.name &&
      updatePublisherDto.name !== existingPublisher.name
    ) {
      const publisherWithSameName =
        await this.prisma.extended.publisher.findUnique({
          where: { name: updatePublisherDto.name },
        });
      if (publisherWithSameName)
        throw new ConflictException(
          'Ya existe un publisher con el mismo nombre',
        );
    }
    const updatedPublisher = await this.prisma.publisher.update({
      where: { id },
      data: updatePublisherDto,
    });
    if(!updatedPublisher)
      throw new BadRequestException('No se pudo actualizar el publisher');
    // Se notifica a los administradores del sistema sobre la actualización del publisher
    const admins = await this.prisma.extended.user.findMany({
      where: { role: { name: 'Administrador' } },
    });
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        title: 'Publisher actualizado',
        message: `Se ha actualizado el publisher con ID: ${updatedPublisher.id}`,
        typeNotification: 'Informativa',
      });
    }
    return updatedPublisher;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica que exista el publisher
    const existingPublisher = await this.findOne(id);
    if (!existingPublisher)
      throw new NotFoundException(
        'No se encontró el publisher con el ID proporcionado',
      );
    // Se verifica que no tenga libros asociados
    const booksCount = await this.prisma.book.count({
      where: { publisherId: id },
    });
    if (booksCount > 0)
      throw new ConflictException(
        'No se puede eliminar el publisher porque tiene libros asociados',
      );
    // Se elimina el publisher
    const deletedPublisher =
      await this.prisma.extended.publisher.softDelete(id);
    if (!deletedPublisher)
      throw new BadRequestException('No se pudo eliminar el publisher');
    // Se notifica a los administradores del sistema sobre la eliminación del publisher
    const admins = await this.prisma.extended.user.findMany({
      where: { role: { name: 'Administrador' } },
    });
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        title: 'Publisher eliminado',
        message: `Se ha eliminado el publisher con ID: ${deletedPublisher.id}`,
        typeNotification: 'Informativa',
      });
    }
    return { message: 'Publisher eliminado correctamente' };
  }
}
