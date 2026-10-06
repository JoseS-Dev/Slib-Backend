import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from './entities/permission.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService){}
  
  async create(createPermissionDto: CreatePermissionDto) : Promise<Permission> {
    // Se verifica que no exista ya el permiso
    const existingPermission = await this.prisma.permission.findUnique({
      where: {name: createPermissionDto.name}
    });
    if(existingPermission) throw new ConflictException('Ya existe el permiso');
    // Si no existe, se crea el permiso
    const newPermission = await this.prisma.permission.create({
      data: createPermissionDto
    });
    if(!newPermission) throw new BadRequestException('No se pudo crear el permiso');
    return newPermission;
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ) : Promise<{data: Permission[], total: number}> {
    const [permissions, total] = await Promise.all([
      this.prisma.extended.permission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'}
      }),
      this.prisma.extended.permission.count()
    ])
    return {data: permissions, total}
  }

  async findOne(id: number) : Promise<Permission> {
    const existingPermission = await this.prisma.extended.permission.findUnique({
      where: {id}
    });
    if(!existingPermission) throw new NotFoundException('No existe dicho permiso')
    return existingPermission
  }

  async update(
    id: number, 
    updatePermissionDto: UpdatePermissionDto
  ) : Promise<Permission> {
    // Se verifica que exista el permiso
    const existingPermission = await this.findOne(id);
    if(!existingPermission) throw new NotFoundException('No existe dicho permiso');
    // Se actualiza el permiso en cuestión
    const updatedPermission = await this.prisma.permission.update({
      where: {id},
      data: {
        ...updatePermissionDto,
        updatedAt: new Date()
      }
    });
    if(!updatedPermission) throw new BadRequestException('No se pudo actualizar el permiso')
    return updatedPermission;
  }

  async remove(id: number) : Promise<string> {
    // Se verifica que exista el permiso
    const existingPermission = await this.findOne(id);
    if(!existingPermission) throw new NotFoundException('No existe dich permiso');
    // Si existe sel elimina
    const deletedPermission = await this.prisma.extended.permission.softDelete(id);
    if(!deletedPermission) throw new BadRequestException("No se pudo eliminar el permiso");
    return 'Permiso eliminado exitosamente'
  }
}
