import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Favorite } from './entities/favorite.entity.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { UpdateFavoriteDto } from './dto/update-favorite.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFavoriteDto: CreateFavoriteDto) : Promise<Favorite> {
    // Se verifica que exista el usuario y el libro
    const [existingUser, existingBook, existingFavorite] = await Promise.all([
      this.prisma.extended.user.findUnique({
        where: { id: createFavoriteDto.userId },
      }),
      this.prisma.extended.book.findUnique({
        where: { id: createFavoriteDto.bookId },
      }),
      this.prisma.favorite.findFirst({
        where: { userId: createFavoriteDto.userId, bookId: createFavoriteDto.bookId },
      }),
    ]);
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el id proporcionado.');
    if(!existingBook) throw new NotFoundException('No se encontró el libro con el id proporcionado.');
    if(existingFavorite) throw new ConflictException('El usuario ya tiene este libro en favoritos.');
    // Si existe, se crea el favorito
    const newFavorite = await this.prisma.favorite.create({
      data: createFavoriteDto
    });
    if(!newFavorite) throw new BadRequestException('No se pudo crear el favorito.');
    return newFavorite;
  }

  async findAll(userId: number, page: number = 1, limit: number = 10) : Promise<{data: Favorite[], total: number, totalPages: number}> {
    // Se verifica que exista el usuario
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { id: userId },
    });
    if(!existingUser) throw new NotFoundException('No se encontró el usuario con el id proporcionado.');
    // Se obtienen los favoritos del usuario
    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          book: true,
        }
      }),
      this.prisma.favorite.count({
        where: { userId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: favorites, total, totalPages };
  }

  async findOne(id: number) : Promise<Favorite> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
      include: {
        book: true,
      }
    });
    if(!favorite) throw new NotFoundException('No se encontró el favorito con el id proporcionado.');
    return favorite;
  }

  async update(id: number, updateFavoriteDto: UpdateFavoriteDto) : Promise<Favorite> {
    // Se verifica que exista el favorito en cuestión
    const existingFavorite = await this.findOne(id);
    if(!existingFavorite) throw new NotFoundException('No se encontró el favorito con el id proporcionado.');
    // Se actualiza el favorito
    const updatedFavorite = await this.prisma.favorite.update({
      where: { id },
      data: updateFavoriteDto,
    });
    if(!updatedFavorite) throw new BadRequestException('No se pudo actualizar el favorito.');
    return updatedFavorite;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que exista el favorito en cuestión
    const existingFavorite = await this.findOne(id);
    if(!existingFavorite) throw new NotFoundException('No se encontró el favorito con el id proporcionado.');
    // Se elimina el favorito
    const deletedFavorite = await this.prisma.favorite.delete({
      where: { id },
    });
    if(!deletedFavorite) throw new BadRequestException('No se pudo eliminar el favorito.');
    return { message: 'Favorito eliminado correctamente.' };
  }
}
