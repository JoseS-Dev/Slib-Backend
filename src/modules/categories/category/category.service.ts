import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) : Promise<Category> {
    // Se verifica que no exista una categoria con el mismo nombre
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });
    if(existingCategory) throw new ConflictException('Ya existe una categoria con el mismo nombre');
    // Si no existe, se crea la categoria
    const category = await this.prisma.$transaction(async (tx) => {
      const newCategory = await tx.category.create({
        data: {
          name: createCategoryDto.name,
          description: createCategoryDto.description ?? null,
          subcategories: {
            create: (createCategoryDto.subCategories ?? []).map((subcategory) => ({
              name: subcategory.name,
              description: subcategory.description ?? null,
            }))
          }
        },
        include: {
          subcategories: true,
        }
      });
      return newCategory;
    });
    if(!category) throw new BadRequestException('No se pudo crear la categoria');
    return category;
  }

  async findAll(page: number = 1, limit: number = 10) : Promise<{data: Category[], total: number, totalPages: number}> {
    const [categories, total] = await Promise.all([
      this.prisma.extended.category.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          subcategories: true,
        }
      }),
      this.prisma.extended.category.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: categories, total, totalPages };
  }

  async findAllActive(page: number = 1, limit: number = 10) : Promise<{data: Category[], total: number, totalPages: number}>{
    const [categories, total] = await Promise.all([
      this.prisma.extended.category.findMany({
        where: { isActive: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          subcategories: true,
        }
      }),
      this.prisma.extended.category.count({
        where: { isActive: true },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: categories, total, totalPages };
  }

  async findOne(id: number) : Promise<Category> {
    const category = await this.prisma.extended.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
      }
    });
    if(!category) throw new NotFoundException('No se encontró la categoria');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) : Promise<Category> {
    // Se verifica que la categoria exista
    const existingCategory = await this.findOne(id);
    if(!existingCategory) throw new NotFoundException('No se encontró la categoria');
    // Se actualiza la categoria
    const category = await this.prisma.$transaction(async (tx) => {
      // Se verifica que no exista otra categoria con el mismo nombre
      if(updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name){
        const categoryWithSameName = await tx.category.findUnique({
          where: { name: updateCategoryDto.name },
        });
        if(categoryWithSameName) throw new ConflictException('Ya existe una categoria con el mismo nombre');
      }
      const updatedCategory = await tx.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          ...(updateCategoryDto.subCategories && {
            subcategories: {
              create: updateCategoryDto.subCategories.map((subcategory) => ({
                name: subcategory.name,
                description: subcategory.description ?? null,
              }))
            }
          })
        },
        include: {
          subcategories: true,
        }
      });
      return updatedCategory;
    });
    if(!category) throw new BadRequestException('No se pudo actualizar la categoria');
    return category;
  }

  async changeStatus(id: number, isActive: boolean) : Promise<Category> {
    // Se verifica que la categoria exista
    const existingCategory = await this.findOne(id);
    if(!existingCategory) throw new NotFoundException('No se encontró la categoria');
    // Se actualiza el estado de la categoria
    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive },
      include: {
        subcategories: true,
      }
    });
    if(!category) throw new BadRequestException('No se pudo actualizar el estado de la categoria');
    return category;
  }

  async remove(id: number): Promise<{message: string}> {
    // Se verifica que la categoria exista
    const existingCategory = await this.findOne(id);
    if(!existingCategory) throw new NotFoundException('No se encontró la categoria');
    // Se elimina la categoria
    const category = await this.prisma.extended.category.softDelete(id);
    if(!category) throw new BadRequestException('No se pudo eliminar la categoria');
    return { message: 'Categoria eliminada correctamente' };
  }
}
