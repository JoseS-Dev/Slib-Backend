import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { createNotificationSchema } from '../../../../shared/index.js';
import { NotificationType } from '../../../../../generated/prisma/enums.js';

export class CreateNotificationDto extends createZodDto(
  createNotificationSchema,
) {
  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario destinatario de la notificación',
  })
  declare userId: number;

  @ApiProperty({
    example: 'Nueva multa generada',
    description: 'Título de la notificación',
    minLength: 1,
    maxLength: 100,
  })
  declare title: string;

  @ApiProperty({
    example: 'Se ha generado una multa por retraso en la devolución.',
    description: 'Cuerpo del mensaje de la notificación',
    minLength: 1,
    maxLength: 500,
  })
  declare message: string;

  @ApiProperty({
    example: 'Multa',
    description: 'Tipo de notificación',
    enum: NotificationType,
  })
  declare typeNotification: NotificationType;
}
