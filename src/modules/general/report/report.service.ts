import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Report } from './entities/report.entity.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { PrismaService } from "../../../prisma/prisma.service.js";

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto) : Promise<Report> {
    // Se verifica que el usuario exista y que sea un administrador o Recepcionista antes de crear el reporte
    const existingUser = await this.prisma.extended.user.findFirst({
      where: {
        id: createReportDto.userId,
        role: {
          OR: [
            { name: 'Administrador' },
            { name: 'Recepcionista' }
          ]
        }
      }
    });
    if(!existingUser) throw new NotFoundException('No sé encontro el usuario o no tiene permisos para crear un reporte');
    // Se crea el reporte
    const newReport = await this.prisma.report.create({
      data: createReportDto
    });
    if(!newReport) throw new BadRequestException('No se pudo crear el reporte');
    return newReport;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    month?: number
  ) : Promise<{data: Report[], total: number, totalPages: number}> {
   const [reports, total] = await Promise.all([
    this.prisma.extended.report.findMany({
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
        user: true
      }
    }),
    this.prisma.extended.report.count({
      where: {
        ...(month ? {
          createdAt: {
            gte: new Date(new Date().getFullYear(), month - 1, 1),
            lt: new Date(new Date().getFullYear(), month, 1)
          }
        } : {})
      }
    })
   ])
   const totalPages = Math.ceil(total / limit);
   return {data: reports, total, totalPages};
  }

  async findAllByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
    month?: number
  ) : Promise<{data: Report[], total: number, totalPages: number}> {
    // Se verifica que exista el usuario y que sea un administrador o recepcionista
    const existingUser = await this.prisma.extended.user.findFirst({
      where: {
        id: userId,
        role: {
          OR: [
            { name: 'Administrador' },
            { name: 'Recepcionista' }
          ]
        }
      }
    });
    if(!existingUser) throw new NotFoundException('No sé encontro el usuario o no tiene permisos para ver los reportes');
    const [reports, total] = await Promise.all([
      this.prisma.extended.report.findMany({
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
          user: true
        }
      }),
      this.prisma.extended.report.count({
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
    ])
    const totalPages = Math.ceil(total / limit);
    return {data: reports, total, totalPages};
  }

  async findOne(id: number) : Promise<Report> {
    const report = await this.prisma.extended.report.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
    if(!report) throw new NotFoundException('No se encontró el reporte');
    return report;
  }

  async update(id: number, updateReportDto: UpdateReportDto) : Promise<Report> {
    // Se verifica que el reporte exista antes de actualizarlo
    const existingReport = await this.findOne(id);
    if(!existingReport) throw new NotFoundException('No se encontró el reporte');
    const report = await this.prisma.extended.report.update({
      where: { id },
      data: updateReportDto,
      include: {
        user: true
      }
    });
    if(!report) throw new BadRequestException('No se encontró el reporte');
    return report;
  }

  async changeStatus(id: number, isActive: boolean) : Promise<Report> {
    const existingReport = await this.findOne(id);
    if(!existingReport) throw new NotFoundException('No se encontró el reporte');
    const report = await this.prisma.extended.report.update({
      where: { id },
      data: { isActive },
      include: {
        user: true
      }
    });
    if(!report) throw new BadRequestException('No se encontró el reporte');
    return report;
  }

  async remove(id: number) : Promise<{message: string}> {
    const existingReport = await this.findOne(id);
    if(!existingReport) throw new NotFoundException('No se encontró el reporte');
    const deletedReport = await this.prisma.extended.report.softDelete(id);
    if(!deletedReport) throw new BadRequestException('No se pudo eliminar el reporte');
    return {message: 'Reporte eliminado correctamente'};
  }
}
