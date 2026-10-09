import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Book } from './entities/book.entity.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { deleteStoredFile } from '../../../utils/functions/function.js';
@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const validations: Promise<any>[] = [];
    if (createBookDto.categoryId) {
      validations.push(
        this.prisma.extended.category
          .findUnique({
            where: { id: createBookDto.categoryId },
            select: { id: true },
          })
          .then((category) => {
            if (!category)
              throw new NotFoundException(
                'No se encontró la categoría especificada',
              );
          }),
      );
    }
    if (createBookDto.subcategoryId) {
      validations.push(
        this.prisma.extended.subcategory
          .findUnique({
            where: { id: createBookDto.subcategoryId },
            select: { id: true },
          })
          .then((subcategory) => {
            if (!subcategory)
              throw new NotFoundException(
                'No se encontró la subcategoría especificada',
              );
          }),
      );
    }
    if (createBookDto.publisherId) {
      validations.push(
        this.prisma.extended.publisher
          .findUnique({
            where: { id: createBookDto.publisherId },
            select: { id: true },
          })
          .then((publisher) => {
            if (!publisher)
              throw new NotFoundException(
                'No se encontró la editorial especificada',
              );
          }),
      );
    }
    await Promise.all(validations);
    // Si todas las validaciones pasan, se crea el libro
    const book = await this.prisma.book.create({
      data: createBookDto,
    });
    if (!book) throw new BadRequestException('No se pudo crear el libro');
    return book;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Book[]; total: number; totalPages: number }> {
    const [books, total] = await Promise.all([
      this.prisma.extended.book.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          publisher: true,
        },
        omit: {
          deletedAt: true,
          mimeType: true,
          fileSize: true,
        },
      }),
      this.prisma.extended.book.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: books, total, totalPages };
  }

  async findAllByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Book[]; total: number; totalPages: number }> {
    const [books, total] = await Promise.all([
      this.prisma.extended.book.findMany({
        where: { categoryId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          publisher: true,
        },
        omit: {
          deletedAt: true,
          mimeType: true,
          fileSize: true,
        },
      }),
      this.prisma.extended.book.count({
        where: { categoryId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: books, total, totalPages };
  }

  async findAllBySubcategory(
    subcategoryId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Book[]; total: number; totalPages: number }> {
    const [books, total] = await Promise.all([
      this.prisma.extended.book.findMany({
        where: { subcategoryId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          publisher: true,
        },
        omit: {
          deletedAt: true,
          mimeType: true,
          fileSize: true,
        },
      }),
      this.prisma.extended.book.count({
        where: { subcategoryId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: books, total, totalPages };
  }

  async findAllByPublisher(
    publisherId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Book[]; total: number; totalPages: number }> {
    const [books, total] = await Promise.all([
      this.prisma.extended.book.findMany({
        where: { publisherId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          publisher: true,
        },
        omit: {
          deletedAt: true,
          mimeType: true,
          fileSize: true,
        },
      }),
      this.prisma.extended.book.count({
        where: { publisherId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: books, total, totalPages };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.prisma.extended.book.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        publisher: true,
      },
      omit: {
        deletedAt: true,
        mimeType: true,
        fileSize: true,
      },
    });
    if (!book)
      throw new NotFoundException('No se encontró el libro especificado');
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    // Se verifica que el libro exista
    const existingBook = await this.findOne(id);
    if (!existingBook)
      throw new NotFoundException('No se encontró el libro especificado');
    // Si se va a actualizar la categoría, subcategoría o editorial, se verifica que existan
    const validations: Promise<any>[] = [];
    if (updateBookDto.categoryId) {
      validations.push(
        this.prisma.extended.category
          .findUnique({
            where: { id: updateBookDto.categoryId },
            select: { id: true },
          })
          .then((category) => {
            if (!category)
              throw new NotFoundException(
                'No se encontró la categoría especificada',
              );
          }),
      );
    }
    if (updateBookDto.subcategoryId) {
      validations.push(
        this.prisma.extended.subcategory
          .findUnique({
            where: { id: updateBookDto.subcategoryId },
            select: { id: true },
          })
          .then((subcategory) => {
            if (!subcategory)
              throw new NotFoundException(
                'No se encontró la subcategoría especificada',
              );
          }),
      );
    }
    if (updateBookDto.publisherId) {
      validations.push(
        this.prisma.extended.publisher
          .findUnique({
            where: { id: updateBookDto.publisherId },
            select: { id: true },
          })
          .then((publisher) => {
            if (!publisher)
              throw new NotFoundException(
                'No se encontró la editorial especificada',
              );
          }),
      );
    }
    await Promise.all(validations);
    // Si se va a actualizar la imagen del libro, se elimina la imagen anterior
    if (updateBookDto.frontCoverUrl && existingBook.frontCoverUrl) {
      await deleteStoredFile(existingBook.frontCoverUrl);
    }
    // Si todas las validaciones pasan, se actualiza el libro
    const book = await this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
    if (!book) throw new BadRequestException('No se pudo actualizar el libro');
    return book;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Se verifica que el libro exista
    const existingBook = await this.findOne(id);
    if (!existingBook)
      throw new NotFoundException('No se encontró el libro especificado');
    // Se elimina la imagen del libro si existe
    if (existingBook.frontCoverUrl) {
      await deleteStoredFile(existingBook.frontCoverUrl);
    }
    // Se elimina el libro
    const book = await this.prisma.extended.book.softDelete(id);
    if (!book) throw new BadRequestException('No se pudo eliminar el libro');
    return { message: 'Libro eliminado correctamente' };
  }
}
