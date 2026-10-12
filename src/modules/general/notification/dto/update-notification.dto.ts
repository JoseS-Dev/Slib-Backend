import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { updateNotificationSchema } from '../../../../shared/index.js';
import { NotificationType } from '../../../../../generated/prisma/enums.js';

export class UpdateNotificationDto extends createZodDto(
  updateNotificationSchema,
) {
  @ApiProperty({
    example: 'Nueva multa generada',
    description: 'Título de la notificación',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  declare title?: string;

  @ApiProperty({
    example: 'Se ha generado una multa por retraso en la devolución.',
    description: 'Cuerpo del mensaje de la notificación',
    minLength: 1,
    maxLength: 500,
    required: false,
  })
  declare message?: string;

  @ApiProperty({
    example: 'Multa',
    description: 'Tipo de notificación',
    enum: NotificationType,
    required: false,
  })
  declare typeNotification?: NotificationType;

  @ApiProperty({
    example: true,
    description: 'Marca la notificación como leída o no leída',
    required: false,
  })
  declare isRead?: boolean;
}
