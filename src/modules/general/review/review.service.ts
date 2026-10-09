import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Review } from './entities/review.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js'

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService){}

  async create(createReviewDto: CreateReviewDto) : Promise<Review> {
    // Se verifica que exista el usuario y el libro en cuestión
    const [existingUser, existingBook, existingReview] = await Promise.all([
      this.prisma.extended.user.findUnique({
        where: {id: createReviewDto.userId}
      }),
      this.prisma.extended.book.findUnique({
        where: {id: createReviewDto.bookId}
      }),
      this.prisma.review.findFirst({
        where: {
          userId: createReviewDto.userId, 
          bookId: createReviewDto.bookId
        }
      })
    ]);
    if(!existingUser) throw new NotFoundException('No sé encontró el usuario con el ID propocionado');
    if(!existingReview) throw new NotFoundException('No sé encontró el libro con el ID propocionado');
    if(existingReview) throw new ConflictException('Ya existe una reseña de este usuario a dicho libro');
    // Si existe, se crea la reseña
    const newReview = await this.prisma.review.create({
      data: createReviewDto
    });
    if(!newReview) throw new BadRequestException('No se pudo crear la reseña');
    return newReview;
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ) : Promise<{data: Review[], total: number, totalPages: number}> {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          user: true,
          book: true
        }
      }),
      this.prisma.review.count()
    ]);
    const totalPages = Math.ceil(total / limit)
    return {data: reviews, total, totalPages}
  }

  async findAllByUser(
    userId: number,
    page: number = 1,
    limit: number = 10
  ) : Promise<{data: Review[], total: number, totalPages: number}>{
    // Se verifica que exista el usuario en cuestión
    const existingUser = await this.prisma.extended.user.findUnique({
      where: {id: userId}
    });
    if(!existingUser) throw new NotFoundException('No sé encontró el usuario')
    // Si existe, se obtiene todas sus reseñas
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {isActive: true, userId},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: "desc"},
        include: {
          book: true
        }
      }),
      this.prisma.review.count({
        where: {isActive: true, userId}
      })
    ]);
    const totalPages = Math.ceil(total / limit)
    return {data: reviews, total, totalPages}
  }

  async findAllByBook(
    bookId: number,
    page: number = 1,
    limit: number = 10
  ) : Promise<{data: Review[], total: number, totalPages: number}>{
    // Se verifica que exista el usuario en cuestión
    const existingBook = await this.prisma.extended.book.findUnique({
      where: {id: bookId}
    });
    if(!existingBook) throw new NotFoundException('No sé encontró el usuario')
    // Si existe, se obtiene todas sus reseñas
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {isActive: true, bookId},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: "desc"},
        include: {
          user: true
        }
      }),
      this.prisma.review.count({
        where: {isActive: true, bookId}
      })
    ]);
    const totalPages = Math.ceil(total / limit)
    return {data: reviews, total, totalPages}
  }

  async findOne(id: number) : Promise<Review> {
    // Se verifica que exista la reseña
    const review = await this.prisma.review.findUnique({
      where: {id}
    });
    if(!review) throw new NotFoundException('No sé encontro la reseña con el ID propocionado');
    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) : Promise<Review> {
    // Se verifica que exista la reseña a actualizar
    const existingReview = await this.findOne(id);
    if(!existingReview) throw new NotFoundException('No sé encontró la reseña');
    // Se actualiza la reseña
    const updatedReview = await this.prisma.review.update({
      where: {id},
      data: updateReviewDto
    });
    if(!updatedReview) throw new BadRequestException('No se pudo actualizar la reseña');
    return updatedReview;
  }

  async changeStatus(id: number, isActive: boolean) : Promise<Review> {
    // Se verifica que exista la reseña a actualizar
    const existingReview = await this.findOne(id);
    if(!existingReview) throw new NotFoundException('No sé encontró la reseña');
    // Se actualiza la reseña
    const updatedReview = await this.prisma.review.update({
      where: {id},
      data: {
        isActive: isActive
      }
    });
    if(!updatedReview) throw new BadRequestException('No se pudo actualizar la reseña');
    return updatedReview;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que exista la reseña a actualizar
    const existingReview = await this.findOne(id);
    if(!existingReview) throw new NotFoundException('No sé encontró la reseña');
    // Se elimina la reseña
    const deletedReview = await this.prisma.review.delete({
      where: {id}
    });
    if(!deletedReview) throw new BadRequestException('No se pudo eliminar la reseña')
    return {message: 'Reseña eliminada exitosamente'};
  }
}
