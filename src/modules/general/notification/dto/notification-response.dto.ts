import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../entities/notification.entity.js';

export class NotificationResponse {
  @ApiProperty({
    example: 1,
    description: 'Identificador único de la notificación',
  })
  id!: number;

  @ApiProperty({
    example: 7,
    description: 'Identificador del usuario destinatario',
  })
  userId!: number;

  @ApiProperty({
    example: 'Nueva multa generada',
    description: 'Título de la notificación',
  })
  title!: string;

  @ApiProperty({
    example: 'Se ha generado una multa por retraso en la devolución.',
    description: 'Cuerpo del mensaje',
  })
  message!: string;

  @ApiProperty({
    example: 'Multa',
    description: 'Tipo de notificación',
  })
  typeNotification!: string;

  @ApiProperty({
    example: false,
    description: 'Indica si la notificación ha sido leída',
  })
  isRead!: boolean;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Fecha de la última actualización',
  })
  updatedAt!: Date;
}

export class PaginatedNotificationsResponse {
  @ApiProperty({
    type: [NotificationResponse],
    description: 'Listado de notificaciones de la página actual',
  })
  data!: NotificationResponse[];

  @ApiProperty({
    example: 51,
    description: 'Número total de notificaciones del usuario',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Número de la página actual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página' })
  limit!: number;

  @ApiProperty({ example: 6, description: 'Número total de páginas' })
  totalPages!: number;
}

export class MarkAllAsReadResponse {
  @ApiProperty({
    example: 51,
    description: 'Cantidad de notificaciones que fueron marcadas como leídas',
  })
  count!: number;
}

export class NotificationDeleteResponse {
  @ApiProperty({
    example: 'Notificación eliminada correctamente',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}

export class NotificationErrorResponse {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró el usuario para la notificación',
    description: 'Mensaje descriptivo del error',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Tipo de error devuelto por el servidor',
  })
  error!: string;
}
