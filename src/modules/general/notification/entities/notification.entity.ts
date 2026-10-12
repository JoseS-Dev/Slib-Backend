import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../../../generated/prisma/enums.js';

export class Notification {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la notificación',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario destinatario de la notificación',
  })
  userId!: number;

  @ApiProperty({
    example: 'Nueva multa generada',
    description: 'Título de la notificación',
    maxLength: 100,
  })
  title!: string;

  @ApiProperty({
    example:
      'Se ha generado una multa por retraso en la devolución del libro "Cien años de soledad".',
    description: 'Cuerpo del mensaje de la notificación',
    maxLength: 500,
  })
  message!: string;

  @ApiProperty({
    example: 'Multa',
    description: 'Tipo de notificación',
    enum: NotificationType,
  })
  typeNotification!: NotificationType;

  @ApiProperty({
    example: false,
    description: 'Indica si la notificación ha sido leída por el usuario',
  })
  isRead!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación de la notificación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización de la notificación',
  })
  updatedAt!: Date;
}
