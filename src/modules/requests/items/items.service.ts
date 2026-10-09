import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Item } from './entities/item.entity.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { RequestStatus } from '../../../../generated/prisma/enums.js';
import { RecordRequestItemStatus } from '../../../utils/constants/constant.js';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) : Promise<Item> {
    // Se verifica que exista la solicitud y el ejemplar fisico
    const [existingRequest, existingPhysical] = await Promise.all([
      this.prisma.request.findUnique({
        where: { id: createItemDto.requestId },
      }),
      this.prisma.extended.physicalCopy.findUnique({
        where: { id: createItemDto.physicalCopyId },
      })
    ]);
    if(!existingRequest) throw new NotFoundException('No sé encontró la solicitud con el id proporcionado.');
    if(!existingPhysical) throw new NotFoundException('No sé encontró el ejemplar físico con el id proporcionado.');
    // Si existe, se crea el item
    const newItem = await this.prisma.requestItem.create({
      data: createItemDto
    });
    if(!newItem) throw new BadRequestException('No se pudo crear el item de la solicitud.');
    return newItem;
  }

  async findAll(requestId: number, page: number = 1, limit: number = 10) : Promise<{data: Item[], total: number, totalPages: number}> {
    // Se verifica que exista la solicitud en cuestión
    const existingRequest = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if(!existingRequest) throw new NotFoundException('No sé encontró la solicitud con el id proporcionado.');
    // Se obtienen los items de la solicitud
    const [items, total] = await Promise.all([
      this.prisma.requestItem.findMany({
        where: { requestId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.requestItem.count({
        where: { requestId },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: items, total, totalPages };
  }

  async findOne(id: number) : Promise<Item> {
    const item = await this.prisma.requestItem.findUnique({
      where: { id },
    });
    if(!item) throw new NotFoundException('No sé encontró el item con el id proporcionado.');
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) : Promise<Item> {
    // Se verifica que exista el item en cuestión
    const existingItem = await this.findOne(id);
    if(!existingItem) throw new NotFoundException('No sé encontró el item con el id proporcionado.');
    // Se verifica que el nuevo estado sea válido según RecordRequestItemStatus
    const currentStatus = existingItem.status;
    if(currentStatus === updateItemDto.status){
      throw new BadRequestException(`El item ya tiene el estado ${currentStatus}.`);
    }
    const validNextStatuses = RecordRequestItemStatus[currentStatus];
    if(!validNextStatuses?.includes(updateItemDto.status!)){
      throw new BadRequestException(`El estado ${updateItemDto.status} no es válido para el item con estado actual ${currentStatus}.`);
    }
    // Se actualiza el item
    const updatedItem = await this.prisma.requestItem.update({
      where: { id },
      data: {
        status: updateItemDto.status,
      },
    });
    if(!updatedItem) throw new BadRequestException('No se pudo actualizar el item de la solicitud.');
    return updatedItem;
  }

  async remove(id: number) : Promise<{message: string}> {
    // Se verifica que exista el item en cuestión
    const existingItem = await this.findOne(id);
    if(!existingItem) throw new NotFoundException('No sé encontró el item con el id proporcionado.');
    // Se elimina el item
    const deletedItem = await this.prisma.requestItem.delete({
      where: { id },
    });
    if(!deletedItem) throw new BadRequestException('No se pudo eliminar el item de la solicitud.');
    return { message: 'Item eliminado correctamente.' };
  }
}
