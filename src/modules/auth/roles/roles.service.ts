import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from './entities/role.entity.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService){}

  // Crear un Rol
  async create(createRoleDto: CreateRoleDto) : Promise<Role> {
    // Se verifica que no exista un rol con el mismo nombre
    const existingRol = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name }
    });
    if(existingRol) throw new ConflictException('El rol ya existe');
    // Si no existe, se crea el rol
    const role = await this.prisma.$transaction(async (tx) => {
      // Creamos el nuevo rol
      const newRole = await tx.role.create({
        data: {
          name: createRoleDto.name,
          isDefault: createRoleDto.isDefault ?? false
        }
      });
      if(createRoleDto.permissionsIds && createRoleDto.permissionsIds.length > 0){
        await tx.rolePermission.createMany({
          data: createRoleDto.permissionsIds.map(permissionId => ({
            roleId: newRole.id,
            permissionId: permissionId
          }))
        })
      }
      return tx.role.findUnique({
        where: {id: newRole.id},
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
    });
    if(!role) throw new BadRequestException('No se pudo crear el rol');
    return role;
  }

  async findAll(page: number = 1, limit: number = 10) : Promise<{data: Role[], total: number, totalPages: number}> {
    const [roles, total] = await Promise.all([
      this.prisma.extended.role.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }),
      this.prisma.extended.role.count()
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: roles, total, totalPages };
  }

  async findOne(id: number) : Promise<Role> {
    const role = await this.prisma.extended.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    if(!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) : Promise<Role> {
    // Se verifica que exista el role que se va actualizar
    const existingRole = await this.findOne(id);
    if(!existingRole) throw new NotFoundException('Rol no encontrado');
    // Se actualiza el rol
    const role = await this.prisma.$transaction(async (tx) => {
      // Se verifica si se va a actualizar el nombre del rol y si ya existe otro rol con el mismo nombre
      if(updateRoleDto.name && updateRoleDto.name !== existingRole.name){
        const roleWithSameName = await tx.role.findUnique({
          where: { name: updateRoleDto.name }
        });
        if(roleWithSameName) throw new ConflictException('El rol ya existe');
      }
      // Se actualiza el rol
      const updatedRole = await tx.role.update({
        where: { id },
        data: {
          name: updateRoleDto.name ?? existingRole.name,
          isDefault: updateRoleDto.isDefault ?? false,
          updatedAt: new Date()
        }
      });
      // Si se van a actualizar los permisos del rol, se eliminan los permisos existentes y se agregan los nuevos
      if(updateRoleDto.permissionsIds){
        await tx.rolePermission.deleteMany({
          where: { roleId: id }
        });
        // Se crea los nuevos permisos del rol
        await tx.rolePermission.createMany({
          data: updateRoleDto.permissionsIds.map(permissionId => ({
            roleId: updatedRole.id,
            permissionId: permissionId
          }))
        });
      }
      return tx.role.findUnique({
        where: { id: updatedRole.id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
    });
    if(!role) throw new BadRequestException('No se pudo actualizar el rol');
    return role;
  }

  async remove(id: number) : Promise<string> {
    // Se verifica que exista el rol a eliminar
    const existingRole = await this.findOne(id);
    if(!existingRole) throw new NotFoundException('Rol no encontrado');
    // Si existe, se elimina el rol
    const deletedRole = await this.prisma.extended.$transaction(async (tx) => {
      // Se eliminan los permisos del rol
      await tx.rolePermission.deleteMany({
        where: { roleId: id }
      });
      // Se elimina el rol
      const deleted = await tx.role.softDelete(id);
      return deleted;
    });
    if(!deletedRole) throw new BadRequestException('No se pudo eliminar el rol');
    return 'Rol eliminado correctamente';
  }
}
