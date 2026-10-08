import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookAuthor } from './entities/book-author.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateBookAuthorDto } from './dto/create-book-author.dto.js';

@Injectable()
export class BookAuthorService {
  constructor(private prisma: PrismaService) {}

  async create(createBookAuthorDto: CreateBookAuthorDto) : Promise<BookAuthor> {
    // Se verifiica que exista el autor y el libro antes de crear la relación
    const [existingBook, existingAuthor] = await Promise.all([
      this.prisma.extended.book.findUnique({
        where: { id: createBookAuthorDto.bookId },
      }),
      this.prisma.extended.author.findUnique({
        where: { id: createBookAuthorDto.authorId },
      }),
    ]);
    if(!existingBook) throw new NotFoundException('No se encontró el libro con el ID proporcionado');
    if(!existingAuthor) throw new NotFoundException('No se encontró el autor con el ID proporcionado');
    // Si existe, se crea la relación
    return this.prisma.bookAuthor.create({
      data: createBookAuthorDto
    });
  }

  async findAllByBook(bookId: number, page: number = 1, limit: number = 10) : Promise<{data: BookAuthor[], total: number, totalPages: number}> {
    // Se verifica que exista el libro
    const existingBook = await this.prisma.extended.book.findUnique({
      where: { id: bookId },
    });
    if(!existingBook) throw new NotFoundException('No se encontró el libro con el ID proporcionado');
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
        }
      }),
      this.prisma.bookAuthor.count({
        where: { bookId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: relations, total, totalPages };
  }

  async findAllByAuthor(authorId: number, page: number = 1, limit: number = 10) : Promise<{data: BookAuthor[], total: number, totalPages: number}> {
    // Se verifica que exista el autor
    const existingAuthor = await this.prisma.extended.author.findUnique({
      where: { id: authorId },
    });
    if(!existingAuthor) throw new NotFoundException('No se encontró el autor con el ID proporcionado');
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
        }
      }),
      this.prisma.bookAuthor.count({
        where: { authorId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: relations, total, totalPages };
  }




  async remove(bookId: number, authorId: number) : Promise<{message: string}> {
    // Se verifica que exista la relación entre el libro y el autor
    const existingRelation = await this.prisma.bookAuthor.findUnique({
      where: {
        bookId_authorId: {
          bookId,
          authorId,
        }
      }
    });
    if(!existingRelation) throw new NotFoundException('No se encontró la relación entre el libro y el autor con los IDs proporcionados');
    // Si existe, se elimina la relación
    const deletedRelation = await this.prisma.bookAuthor.delete({
      where: {
        bookId_authorId: {
          bookId,
          authorId,
        }
      }
    });
    if(!deletedRelation) throw new BadRequestException('No se pudo eliminar la relación entre el libro y el autor');
    return { message: 'Relación entre libro y autor eliminada correctamente' };
  }
}
