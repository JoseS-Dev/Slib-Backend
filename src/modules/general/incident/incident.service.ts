import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Incident } from './entities/incident.entity.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { IncidentType } from '../../../../generated/prisma/enums.js';
import { RecordIncidentStatus } from '../../../utils/constants/constant.js';

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIncidentDto: CreateIncidentDto) : Promise<Incident> {
    // Se verifica que exista e usuario, el ejemplar fisico del libro y el prestamo antes de crear el incidente
    const validations: Promise<any>[] = [];
    if(createIncidentDto.userId) {
      validations.push(
        this.prisma.extended.user.findUnique({
          where: { id: createIncidentDto.userId }
        }).then(user => {
          if(!user) throw new NotFoundException('No se encontró el usuario especificado');
        })
      )
    }
    if(createIncidentDto.physicalCopyId) {
      validations.push(
        this.prisma.extended.physicalCopy.findUnique({
          where: { id: createIncidentDto.physicalCopyId }
        }).then(physicalCopy => {
          if(!physicalCopy) throw new NotFoundException('No se encontró el ejemplar físico del libro especificado');
        })
      )
    }
    if(createIncidentDto.loanId) {
      validations.push(
        this.prisma.extended.loan.findUnique({
          where: { id: createIncidentDto.loanId }
        }).then(loan => {
          if(!loan) throw new NotFoundException('No se encontró el préstamo especificado');
        })
      )
    }
    await Promise.all(validations);
    // Se crea el incidente
    const newIncident = await this.prisma.incident.create({
      data: createIncidentDto
    });
    return newIncident;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    month?: number
  ) : Promise<{data: Incident[], total: number, totalPages: number}> {
    const [incidents, total] = await Promise.all([
      this.prisma.extended.incident.findMany({
        where: {
          ...(month ? {
            createdAt: {
              gte: new Date(new Date().getFullYear(), month - 1, 1),
              lt: new Date(new Date().getFullYear(), month, 1)
            }
          } : {})
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          user: true,
          physical: true,
          loan: true
        }
      }),
      this.prisma.extended.incident.count({
        where: {
          ...(month ? {
            createdAt: {
              gte: new Date(new Date().getFullYear(), month - 1, 1),
              lt: new Date(new Date().getFullYear(), month, 1)
            }
          } : {})
        }
      })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {data: incidents, total, totalPages};
  }

  async findAllByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
    month?: number
  ) : Promise<{data: Incident[], total: number, totalPages: number}> {
    // Se verifica que exista el usuario antes de buscar los incidentes
    const user = await this.prisma.extended.user.findUnique({
      where: { id: userId }
    });
    if(!user) throw new NotFoundException('No se encontró el usuario especificado');
    const [incidents, total] = await Promise.all([
      this.prisma.extended.incident.findMany({
        where: {
          userId,
          ...(month ? {
            createdAt: {
              gte: new Date(new Date().getFullYear(), month - 1, 1),
              lt: new Date(new Date().getFullYear(), month, 1)
            }
          } : {})
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        include: {
          user: true,
          physical: true,
          loan: true
        }
      }),
      this.prisma.extended.incident.count({
        where: {
          userId,
          ...(month ? {
            createdAt: {
              gte: new Date(new Date().getFullYear(), month - 1, 1),
              lt: new Date(new Date().getFullYear(), month, 1)
            }
          } : {})
        }
      })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {data: incidents, total, totalPages};
  }

  async findOne(id: number) : Promise<Incident> {
    const incident = await this.prisma.extended.incident.findUnique({
      where: { id },
      include: {
        user: true,
        physical: true,
        loan: true
      }
    });
    if(!incident) throw new NotFoundException('No se encontró el incidente');
    return incident;
  }

  async update(id: number, updateIncidentDto: UpdateIncidentDto) {
    // Se verifica que el incidente exista antes de actualizarlo
    const existingIncident = await this.findOne(id);
    if(!existingIncident) throw new NotFoundException('No se encontró el incidente');
    // Se actualiza el incidente
    const updatedIncident = await this.prisma.incident.update({
      where: { id },
      data: updateIncidentDto
    });
    if(!updatedIncident) throw new BadRequestException('No se pudo actualizar el incidente');
    return updatedIncident;
  }

  async changeStatus(id: number, newStatus: IncidentType) {
    // Se verifica que el incidente exista antes de actualizar su estado
    const existingIncident = await this.findOne(id);
    if(!existingIncident) throw new NotFoundException
    // Se verifica que el nuevo estado sea válido según el estado actual del incidente
    const currentStatus = existingIncident.status;
    if(currentStatus === newStatus){
      throw new BadRequestException(`El estado actual del incidente es ${currentStatus} y no se puede cambiar al mismo estado.`);
    }
    const allowedStatuses = RecordIncidentStatus[currentStatus];
    if(!allowedStatuses?.includes(newStatus)){
      throw new BadRequestException(`El estado ${newStatus} no es válido para el incidente con estado actual ${currentStatus}.`);
    }
    // Se actualiza el estado del incidente
    const updatedIncident = await this.prisma.incident.update({
      where: { id },
      data: { status: newStatus }
    });
    if(!updatedIncident) throw new BadRequestException('No se pudo actualizar el estado del incidente');
    return updatedIncident;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que el incidente exista antes de eliminarlo
    const existingIncident = await this.findOne(id);
    if(!existingIncident) throw new NotFoundException('No se encontró el incidente');
    // Se elimina el incidente
    const deletedIncident = await this.prisma.extended.incident.softDelete(id);
    if(!deletedIncident) throw new BadRequestException('No se pudo eliminar el incidente');
    return {message: 'Incidente eliminado correctamente'};
  }
}
