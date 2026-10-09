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

@Injectable()
export class PublisherService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    // Se verifica que no exista un publisher con el mismo nombre
    const existingPublisher = await this.prisma.extended.publisher.findUnique({
      where: { name: createPublisherDto.name },
    });
    if (existingPublisher)
      throw new ConflictException('Ya existe un publisher con el mismo nombre');
    return this.prisma.publisher.create({
      data: createPublisherDto,
    });
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
    return this.prisma.publisher.update({
      where: { id },
      data: updatePublisherDto,
    });
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
    return { message: 'Publisher eliminado correctamente' };
  }
}
