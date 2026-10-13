import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Author } from './entities/author.entity.js';
import { CreateAuthorDto } from './dto/create-author.dto.js';
import { UpdateAuthorDto } from './dto/update-author.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { NotificationService } from '../../general/notification/notification.service.js';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.prisma.$transaction(async (tx) => {
      // Se crea el nuevo autor
      const newAuthor = await tx.author.create({
        data: {
          firstName: createAuthorDto.firstName,
          lastName: createAuthorDto.lastName,
          biography: createAuthorDto.biography ?? null,
        },
      });
      if (createAuthorDto.bookIds && createAuthorDto.bookIds.length > 0) {
        await tx.bookAuthor.createMany({
          data: createAuthorDto.bookIds.map((bookId) => ({
            bookId: bookId,
            authorId: newAuthor.id,
          })),
        });
      }
      const res = await tx.author.findUnique({
        where: { id: newAuthor.id },
        include: {
          books: {
            include: {
              book: {
                omit: {
                  deletedAt: true,
                  mimeType: true,
                  fileSize: true,
                },
              },
            },
          },
        },
      });
      // Aplanando la estructura de los libros asociados al autor
      const resWithBooks = {
        ...res!,
        books: res!.books?.map((bookAuthor) => bookAuthor.book) || [],
      };
      // Se notifica a los administradores del sistema sobre un nuevo regitro de autor aun libro
      const admins = await tx.user.findMany({
        where: { role: { name: 'Administrador' } },
      });
      for (const admin of admins) {
        await this.notificationService.create({
          userId: admin.id,
          title: 'Nuevo autor registrado',
          message: `Se ha registrado un nuevo autor con ID: ${newAuthor.id}`,
          typeNotification: 'Informativa',
        });
      }
      return resWithBooks;
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Author[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [authors, total] = await Promise.all([
      this.prisma.extended.author.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          books: {
            include: {
              book: {
                omit: {
                  deletedAt: true,
                  mimeType: true,
                  fileSize: true,
                },
              },
            },
          },
        },
        omit: { deletedAt: true },
      }),
      this.prisma.extended.author.count(),
    ]);
    // Aplanando la estructura de los libros asociados a cada autor
    const authorsWithBooks = authors.map((author) => ({
      ...author,
      books: author.books?.map((bookAuthor) => bookAuthor.book) || [],
    }));
    const totalPages = Math.ceil(total / limit);
    return { data: authorsWithBooks, total, page, limit, totalPages };
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.prisma.extended.author.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            book: {
              omit: {
                deletedAt: true,
                mimeType: true,
                fileSize: true,
              },
            },
          },
        },
      },
      omit: { deletedAt: true },
    });
    if (!author) throw new NotFoundException('No se encontró el autor');
    // Aplanando la estructura de los libros asociados al autor
    return {
      ...author,
      books: author.books?.map((bookAuthor) => bookAuthor.book) || [],
    };
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    // Se verifica si el autor existe
    const author = await this.findOne(id);
    if (!author) throw new NotFoundException('No se encontró el autor');
    // Se actualiza el autor
    const updatedAuthor = await this.prisma.$transaction(async (tx) => {
      const updatedAuthor = await tx.author.update({
        where: { id },
        data: {
          firstName: updateAuthorDto.firstName ?? author.firstName,
          lastName: updateAuthorDto.lastName ?? author.lastName,
          biography: updateAuthorDto.biography ?? author.biography,
        },
      });
      if (updateAuthorDto.bookIds) {
        // Se eliminan los libros asociados al autor
        await tx.bookAuthor.deleteMany({
          where: { authorId: id },
        });
        // Se agregan los nuevos libros asociados al autor
        await tx.bookAuthor.createMany({
          data: updateAuthorDto.bookIds.map((bookId) => ({
            bookId: bookId,
            authorId: updatedAuthor.id,
          })),
        });
      }
      const res = await tx.author.findUnique({
        where: { id: updatedAuthor.id },
        include: {
          books: {
            include: {
              book: {
                omit: {
                  deletedAt: true,
                  mimeType: true,
                  fileSize: true,
                },
              },
            },
          },
        },
        omit: { deletedAt: true },
      });
      // Aplanando la estructura de los libros asociados al autor
      const resWithBooks = {
        ...res!,
        books: res!.books?.map((bookAuthor) => bookAuthor.book) || [],
      };
      // Se notifica a los administradores del sistema sobre la actualización de un autor
      const admins = await tx.user.findMany({
        where: { role: { name: 'Administrador' } },
      });
      for (const admin of admins) {
        await this.notificationService.create({
          userId: admin.id,
          title: 'Autor actualizado',
          message: `Se ha actualizado el autor con ID: ${updatedAuthor.id}`,
          typeNotification: 'Informativa',
        });
      }
      return resWithBooks;
    });
    if (!updatedAuthor)
      throw new BadRequestException('No se pudo actualizar el autor');
    return updatedAuthor;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica si el autor existe
    const author = await this.findOne(id);
    if (!author) throw new NotFoundException('No se encontró el autor');
    // Se elimina el autor
    const deletedAuthor = await this.prisma.extended.$transaction(
      async (tx) => {
        // Se eliminan los libros asociados al autor
        await tx.bookAuthor.deleteMany({
          where: { authorId: id },
        });
        // Se elimina el autor
        const deleted = await tx.author.softDelete(id);
        return deleted;
      },
    );
    if (!deletedAuthor)
      throw new BadRequestException('No se pudo eliminar el autor');
    // Se le notifica a los administradores del sistema sobre la eliminación de un autor
    const admins = await this.prisma.extended.user.findMany({
      where: { role: { name: 'Administrador' } },
    });
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        title: 'Autor eliminado',
        message: `Se ha eliminado el autor con ID: ${deletedAuthor.id}`,
        typeNotification: 'Informativa',
      });
    }
    return { message: 'Autor eliminado correctamente' };
  }
}
