import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Subcategory } from './entities/subcategory.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto.js';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto.js';

@Injectable()
export class SubcategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) : Promise<Subcategory> {
    // Se verifica que no exista una subcategorias con el mismo nombre
    const existingSubcategory = await this.prisma.subcategory.findUnique({
      where: { name: createSubcategoryDto.name },
    });
    if(existingSubcategory) throw new ConflictException('Ya existe una subcategoria con el mismo nombre');
    // Si no existe, se crea la subcategoria
    const subcategory = await this.prisma.subcategory.create({
      data: createSubcategoryDto,
    });
    return subcategory;
  }

  async findAll(page: number = 1, limit: number = 10) : Promise<{data: Subcategory[], total: number, totalPages: number}> {
    const [subcategories, total] = await Promise.all([
      this.prisma.extended.subcategory.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        omit: {
          deletedAt: true,
        }
      }),
      this.prisma.extended.subcategory.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: subcategories, total, totalPages };
  }

  async findAllActive(page: number = 1, limit: number = 10) : Promise<{data: Subcategory[], total: number, totalPages: number}> {
    const [subcategories, total] = await Promise.all([
      this.prisma.extended.subcategory.findMany({
        where: { isActive: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        omit: {
          deletedAt: true,
        }
      }),
      this.prisma.extended.subcategory.count({
        where: { isActive: true },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: subcategories, total, totalPages };
  }

  async findAllByCategoryId(categoryId: number, page: number = 1, limit: number = 10) : Promise<{data: Subcategory[], total: number, totalPages: number}> {
    // Se verifica que la categoria exista
    const category = await this.prisma.extended.category.findUnique({
      where: { id: categoryId },
    });
    if(!category) throw new NotFoundException('La categoria no existe');
    const [subcategories, total] = await Promise.all([
      this.prisma.extended.subcategory.findMany({
        where: { categoryId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        omit: {
          deletedAt: true,
        }
      }),
      this.prisma.extended.subcategory.count({
        where: { categoryId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: subcategories, total, totalPages };
  }

  async findOne(id: number) : Promise<Subcategory> {
    const subcategory = await this.prisma.extended.subcategory.findUnique({
      where: { id },
      omit: {
          deletedAt: true,
      }
    });
    if(!subcategory) throw new NotFoundException('La subcategoria no existe');
    return subcategory;
  }

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) : Promise<Subcategory> {
    // Se verifica que la subcategoria exista
    const subcategory = await this.findOne(id);
    if(!subcategory) throw new NotFoundException('La subcategoria no existe');
    // Se verifica que no exista otra subcategoria con el mismo nombre
    if(updateSubcategoryDto.name && updateSubcategoryDto.name !== subcategory.name){
      const existingSubcategory = await this.prisma.subcategory.findUnique({
        where: { name: updateSubcategoryDto.name },
      });
      if(existingSubcategory) throw new ConflictException('Ya existe una subcategoria con el mismo nombre');
    }
    // Se actualiza la subcategoria
    const updatedSubcategory = await this.prisma.subcategory.update({
      where: { id },
      data: updateSubcategoryDto,
    });
    return updatedSubcategory;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que la subcategoria exista
    const subcategory = await this.findOne(id);
    if(!subcategory) throw new NotFoundException('La subcategoria no existe');
    // Se elimina la subcategoria
    const deletedSubcategory = await this.prisma.extended.subcategory.softDelete(id);
    if(!deletedSubcategory) throw new BadRequestException('No se pudo eliminar la subcategoria');
    return { message: 'Subcategoria eliminada correctamente' };
  }
}
