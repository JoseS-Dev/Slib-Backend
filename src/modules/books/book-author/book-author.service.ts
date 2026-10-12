import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookAuthor } from './entities/book-author.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateBookAuthorDto } from './dto/create-book-author.dto.js';
import { NotificationService } from '../../general/notification/notification.service.js';

@Injectable()
export class BookAuthorService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createBookAuthorDto: CreateBookAuthorDto): Promise<BookAuthor> {
    // Se verifiica que exista el autor y el libro antes de crear la relación
    const [existingBook, existingAuthor] = await Promise.all([
      this.prisma.extended.book.findUnique({
        where: { id: createBookAuthorDto.bookId },
      }),
      this.prisma.extended.author.findUnique({
        where: { id: createBookAuthorDto.authorId },
      }),
    ]);
    if (!existingBook)
      throw new NotFoundException(
        'No se encontró el libro con el ID proporcionado',
      );
    if (!existingAuthor)
      throw new NotFoundException(
        'No se encontró el autor con el ID proporcionado',
      );
    // Si existe, se crea la relación
    const newBookAuthor = await this.prisma.bookAuthor.create({
      data: createBookAuthorDto,
    });
    if (!newBookAuthor)
      throw new BadRequestException(
        'No se pudo crear la relación entre el libro y el autor',
      );
    // Se notifica a loa administradores del sistema sobre la creación de la relación entre el libro y el autor
    const admins = await this.prisma.user.findMany({
      where: { role: { name: 'Administrador' } },
    });
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        title: 'Relación libro-autor creada',
        message: `Se ha creado una nueva relación entre el libro con ID: ${existingBook.id} y el autor con ID: ${existingAuthor.id}`,
        typeNotification: 'Informativa',
      });
    }
    return newBookAuthor;
  }

  async findAllByBook(
    bookId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: BookAuthor[]; total: number; totalPages: number }> {
    // Se verifica que exista el libro
    const existingBook = await this.prisma.extended.book.findUnique({
      where: { id: bookId },
    });
    if (!existingBook)
      throw new NotFoundException(
        'No se encontró el libro con el ID proporcionado',
      );
    // Se obtiene la relación entre el libro y los autores
    const [relations, total] = await Promise.all([
      this.prisma.bookAuthor.findMany({
        where: { bookId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { authorId: 'asc' },
        include: {
          book: true,
          author: true,
        },
      }),
      this.prisma.bookAuthor.count({
        where: { bookId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: relations, total, totalPages };
  }

  async findAllByAuthor(
    authorId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: BookAuthor[]; total: number; totalPages: number }> {
    // Se verifica que exista el autor
    const existingAuthor = await this.prisma.extended.author.findUnique({
      where: { id: authorId },
    });
    if (!existingAuthor)
      throw new NotFoundException(
        'No se encontró el autor con el ID proporcionado',
      );
    // Se obtiene la relación entre el autor y los libros
    const [relations, total] = await Promise.all([
      this.prisma.bookAuthor.findMany({
        where: { authorId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { bookId: 'asc' },
        include: {
          book: true,
          author: true,
        },
      }),
      this.prisma.bookAuthor.count({
        where: { authorId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: relations, total, totalPages };
  }

  async remove(bookId: number, authorId: number): Promise<{ message: string }> {
    // Se verifica que exista la relación entre el libro y el autor
    const existingRelation = await this.prisma.bookAuthor.findUnique({
      where: {
        bookId_authorId: {
          bookId,
          authorId,
        },
      },
    });
    if (!existingRelation)
      throw new NotFoundException(
        'No se encontró la relación entre el libro y el autor con los IDs proporcionados',
      );
    // Si existe, se elimina la relación
    const deletedRelation = await this.prisma.bookAuthor.delete({
      where: {
        bookId_authorId: {
          bookId,
          authorId,
        },
      },
    });
    if (!deletedRelation)
      throw new BadRequestException(
        'No se pudo eliminar la relación entre el libro y el autor',
      );
    // Se notifica a los administradores del sistema sobre la eliminación de la relación entre el libro y el autor
    const admins = await this.prisma.user.findMany({
      where: { role: { name: 'Administrador' } },
    });
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        title: 'Relación libro-autor eliminada',
        message: `Se ha eliminado la relación entre el libro con ID: ${bookId} y el autor con ID: ${authorId}`,
        typeNotification: 'Informativa',
      });
    }
    return { message: 'Relación entre libro y autor eliminada correctamente' };
  }
}
