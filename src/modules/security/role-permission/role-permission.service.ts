import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RolePermission } from './entities/role-permission.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto.js';

@Injectable()
export class RolePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolePermissionDto: CreateRolePermissionDto) : Promise<RolePermission> {
    // Se verifica que exista el rol y el permiso que se va a asociar
    const [existingRole, existingPermission] = await Promise.all([
      this.prisma.extended.role.findUnique({
        where: {id: createRolePermissionDto.roleId}
      }),
      this.prisma.extended.permission.findUnique({
        where: {id: createRolePermissionDto.permissionId}
      })
    ])
    if(!existingRole) throw new NotFoundException('No existe el rol especificado');
    if(!existingPermission) throw new NotFoundException('No existe el permiso especificado');
    // Se crea la asociación entre el rol y el permiso
    return this.prisma.rolePermission.create({
      data: createRolePermissionDto
    })
  }

  async findAll(page: number = 1, limit: number = 10) : Promise<{data: RolePermission[], total: number, totalPages: number}> {
    const [rolePermissions, total] = await Promise.all([
      this.prisma.rolePermission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {roleId: 'asc'},
        include: {
          permission: {
            omit: {
              deletedAt: true
            }
          },
          role: {
            omit: {
              deletedAt: true
            }
          }
        }
      }),
      this.prisma.rolePermission.count()
    ])
    const totalPages = Math.ceil(total / limit);
    return {data: rolePermissions, total, totalPages}
  }

  async findAllByRole(roleId: number, page: number = 1, limit: number = 10) : Promise<{data: RolePermission[], total: number, totalPages: number}> {
    // Se verifica que exista el rol
    const existingRol = await this.prisma.extended.role.findUnique({
      where: {id: roleId}
    });
    if(!existingRol) throw new NotFoundException('No existe el rol especificado');
    // Se busca los permisos asociados al rol
    const [rolePermissions, total] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: {roleId},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {permissionId: 'asc'},
        include: {
          permission: {
            omit: {
              deletedAt: true
            }
          },
          role: {
            omit: {
              deletedAt: true
            }
          }
        }
      }),
      this.prisma.rolePermission.count({
        where: {roleId}
      })
    ])
    const totalPages = Math.ceil(total / limit);
    return {data: rolePermissions, total, totalPages}
  }


  async remove(roleId: number, permissionId: number) : Promise<{message: string}> {
    // Se verifica que exista la relación entre el rol y el permiso
    const existingRolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      }
    });
    if(!existingRolePermission) throw new NotFoundException('No existe la relación entre el rol y el permiso especificados');
    // Si existe, se elimina la relación
    const deletedRolePermission = await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      }
    });
    if(!deletedRolePermission) throw new BadRequestException('No se pudo eliminar la relación entre el rol y el permiso especificados');
    return {message: 'Relación entre rol y permiso eliminada exitosamente'}
  }
}
