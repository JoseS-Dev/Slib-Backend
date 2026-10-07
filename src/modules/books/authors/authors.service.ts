import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Author } from './entities/author.entity.js';
import { CreateAuthorDto } from './dto/create-author.dto.js';
import { UpdateAuthorDto } from './dto/update-author.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) : Promise<Author> {
    return this.prisma.$transaction(async (tx) => {
      // Se crea el nuevo autor
      const newAuthor = await tx.author.create({
        data: {
          firstName: createAuthorDto.firstName,
          lastName: createAuthorDto.lastName,
          biography: createAuthorDto.biography ?? null
        }
      });
      if(createAuthorDto.bookIds && createAuthorDto.bookIds.length > 0){
        await tx.bookAuthor.createMany({
          data: createAuthorDto.bookIds.map(bookId => ({
            bookId: bookId,
            authorId: newAuthor.id
          }))
        })
      }
      const res = await tx.author.findUnique({
        where: {id: newAuthor.id},
        include: {
          books: {
            include: {
              book: {
                omit: {
                  deletedAt: true,
                  mimeType: true,
                  fileSize: true,
                }
              }
            }
          }
        }
      })
      return res!;
    })
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ) : Promise<{data: Author[], total: number, totalPages: number}> {
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
                }
              }
            }
          }
        },
        omit: {deletedAt: true}
      }),
      this.prisma.extended.author.count()
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: authors, total, totalPages };
  }

  async findOne(id: number) : Promise<Author> {
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
              }
            }
          }
        }
      },
      omit: {deletedAt: true}
    });
    if(!author) throw new NotFoundException('No se encontró el autor');
    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) : Promise<Author> {
    // Se verifica si el autor existe
    const author = await this.findOne(id);
    if(!author) throw new NotFoundException('No se encontró el autor');
    // Se actualiza el autor
    const updatedAuthor = await this.prisma.$transaction(async (tx) => {
      const updatedAuthor = await tx.author.update({
        where: { id },
        data: {
          firstName: updateAuthorDto.firstName ?? author.firstName,
          lastName: updateAuthorDto.lastName ?? author.lastName,
          biography: updateAuthorDto.biography ?? author.biography
        }
      });
      if(updateAuthorDto.bookIds){
        // Se eliminan los libros asociados al autor
        await tx.bookAuthor.deleteMany({
          where: { authorId: id }
        });
        // Se agregan los nuevos libros asociados al autor
        await tx.bookAuthor.createMany({
          data: updateAuthorDto.bookIds.map(bookId => ({
            bookId: bookId,
            authorId: updatedAuthor.id
          }))
        })
      }
      const res = await tx.author.findUnique({
        where: {id: updatedAuthor.id},
        include: {
          books: {
            include: {
              book: {
                omit: {
                  deletedAt: true,
                  mimeType: true,
                  fileSize: true,
                }
              }
            }
          }
        },
        omit: {deletedAt: true}
      })
      return res!;
    });
    if(!updatedAuthor) throw new BadRequestException('No se pudo actualizar el autor');
    return updatedAuthor;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica si el autor existe
    const author = await this.findOne(id);
    if(!author) throw new NotFoundException('No se encontró el autor');
    // Se elimina el autor
    const deletedAuthor = await this.prisma.extended.$transaction(async (tx) => {
      // Se eliminan los libros asociados al autor
      await tx.bookAuthor.deleteMany({
        where: { authorId: id }
      });
      // Se elimina el autor
      const deleted = await tx.author.softDelete(id);
      return deleted;
    });
    if(!deletedAuthor) throw new BadRequestException('No se pudo eliminar el autor');
    return { message: 'Autor eliminado correctamente' };
  }
}
