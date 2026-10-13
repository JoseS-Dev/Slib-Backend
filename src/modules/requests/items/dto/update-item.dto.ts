import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { RequestItemStatus } from '../../../../../generated/prisma/enums.js';
import { updateItemSchema } from '../../../../shared/dtos/index.js';

export class UpdateItemDto extends createZodDto(updateItemSchema) {
  @ApiProperty({
    example: RequestItemStatus.Pendiente,
    description: 'Estado actual del item',
    required: false,
    enum: RequestItemStatus,
  })
  declare status?: RequestItemStatus;
}
