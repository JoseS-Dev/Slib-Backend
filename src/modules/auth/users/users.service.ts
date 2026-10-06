import argon2 from 'argon2';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { CreateUserDto, CreateAdminUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) : Promise<User> {
    // Se obtiene el rol del usuario a crear
    const role = await this.prisma.extended.role.findUnique({
      where: {name: "Usuario"}
    });
    if(!role) throw new NotFoundException('No existe el rol de usuario');
    // Se verifica que no exista ya un usuario con el mismo correo y nombre de usuario
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {email: createUserDto.email},
          {userName: createUserDto.userName}
        ]
      }
    });
    if(existingUser) throw new ConflictException('Ya existe un usuario con el mismo correo o nombre de usuario');
    // Si no existe, se crea el usuario
    const hashedPassword = await argon2.hash(createUserDto.password);
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        roleId: role.id
      }
    });
    if(!newUser) throw new BadRequestException('No se pudo crear el usuario');
    return newUser;
  }

  async createAdmin(createAdminUserDto: CreateAdminUserDto) : Promise<User> {
    // Se obtiene el ID del rol que se va a asignar al usuario
    const role = await this.prisma.extended.role.findUnique({
      where: {id: createAdminUserDto.roleId}
    });
    if(!role) throw new NotFoundException('No existe el rol especificado');
    // Se verifica que no exista ya un usuario con el mismo correo y nombre de usuario
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {email: createAdminUserDto.email},
          {userName: createAdminUserDto.userName}
        ]
      }
    });
    if(existingUser) throw new ConflictException('Ya existe un usuario con el mismo correo o nombre de usuario');
    // Si no existe, se crea el usuario
    const hashedPassword = await argon2.hash(createAdminUserDto.password);
    const newUser = await this.prisma.user.create({
      data: {
        ...createAdminUserDto,
        password: hashedPassword,
      }
    });
    if(!newUser) throw new BadRequestException('No se pudo crear el usuario');
    return newUser;
  }

  async findAll(page: number = 1, limit: number = 10) : Promise<{data: User[], total: number, totalPages: number}> {
    const [users, total] = await Promise.all([
      this.prisma.extended.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'}
      }),
      this.prisma.extended.user.count()
    ]);
    const totalPages = Math.ceil(total / limit);
    return {data: users, total, totalPages};
  }

  async findAllByActive(page: number = 1, limit: number = 10) : Promise<{data: User[], total: number, totalPages: number}> {
    const [users, total] = await Promise.all([
      this.prisma.extended.user.findMany({
        where: {
          AND: [
            {lockedUntil: null},
            {isActive: true}
          ]
        }
      }),
      this.prisma.extended.user.count({
        where: {
          AND: [
            {lockedUntil: null},
            {isActive: true}
          ]
        }
      })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {data: users, total, totalPages};
  }

  async findOne(id: number) : Promise<User> {
    const existingUser = await this.prisma.extended.user.findUnique({
      where: {id}
    });
    if(!existingUser) throw new NotFoundException('No existe dicho usuario');
    return existingUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto) : Promise<User> {
    // Se verifica que exista el usuario
    const existingUser = await this.findOne(id);
    if(!existingUser) throw new NotFoundException('No existe dicho usuario');
    // Se verifica que no exista otro usuario con el mismo correo y nombre de ususario, si se va actualizar
    if(updateUserDto.email || updateUserDto.userName) {
      const existingUserWithSameEmailOrUserName = await this.prisma.user.findFirst({
        where: {
          NOT: {id},
          OR: [
            {email: updateUserDto.email},
            {userName: updateUserDto.userName}
          ]
        }
      });
      if(existingUserWithSameEmailOrUserName) throw new ConflictException('Ya existe otro usuario con el mismo correo o nombre de usuario');
    }
    // Se actualiza el usuario en cuestión
    const updatedUser = await this.prisma.user.update({
      where: {id},
      data: {
        ...updateUserDto,
        updatedAt: new Date()
      }
    });
    if(!updatedUser) throw new BadRequestException('No se pudo actualizar el usuario');
    return updatedUser;
  }

  async changeStatus(id: number, isActive: boolean) : Promise<User> {
    // Se verifica que exista el usuario
    const existingUser = await this.findOne(id);
    if(!existingUser) throw new NotFoundException('No existe dicho usuario');
    // Se actualiza el estado del usuario en cuestión
    const updatedUser = await this.prisma.user.update({
      where: {id},
      data: {
        isActive,
        updatedAt: new Date()
      }
    });
    if(!updatedUser) throw new BadRequestException('No se pudo actualizar el estado del usuario');
    return updatedUser;
  }

  async remove(id: number) : Promise<string> {
    // Se verifica que exista el usuario
    const existingUser = await this.findOne(id);
    if(!existingUser) throw new NotFoundException('No existe dicho usuario');
    // Se elimina el usuario en cuestión
    const deletedUser = await this.prisma.extended.user.softDelete(id);
    if(!deletedUser) throw new BadRequestException('No se pudo eliminar el usuario');
    return 'Usuario eliminado correctamente';
  }
}
