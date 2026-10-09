import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { Notification } from './entities/notification.entity.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { NotificationType } from '../../../../generated/prisma/enums.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';

@Injectable()
export class NotificationService {
  private notificationsSubject: Subject<Notification> =
    new Subject<Notification>();

  constructor(private readonly prisma: PrismaService) {}

  getNotificationsObservable(): Observable<Notification> {
    return this.notificationsSubject.asObservable();
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    // Se verifica que exista el usuario antes de crear la notificación
    const existingUser = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });
    if (!existingUser)
      throw new NotFoundException(
        'No se encontró el usuario para la notificación',
      );
    // Si existe, se crea la notificación en la base de datos
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
    });
    if (!notification)
      throw new BadRequestException('No se pudo crear la notificación');

    // Se emite la notificación a través del Subject
    this.notificationsSubject.next(notification);
    return notification;
  }

  async findAll(
    userId: number,
    page: number = 1,
    limit: number = 10,
    type?: NotificationType,
  ): Promise<{ data: Notification[]; total: number, totalPages: number }> {
    // Se verifica que exista el usuario antes de buscar las notificaciones
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser)
      throw new NotFoundException(
        'No se encontró el usuario para la notificación',
      );
    // Se obtienen las notificaciones del usuario con paginación y filtrado por tipo si se proporciona
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, ...(type ? { typeNotification: type } : {}) },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId, ...(type ? { typeNotification: type } : {}) },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data: notifications, total, totalPages };
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification)
      throw new NotFoundException('No se encontró la notificación');
    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    // Se verifica que exista la notificación antes de actualizarla
    const existingNotification = await this.findOne(id);
    if (!existingNotification)
      throw new NotFoundException(
        'No se encontró la notificación para actualizar',
      );
    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
    if (!updatedNotification)
      throw new BadRequestException('No se pudo actualizar la notificación');
    return updatedNotification;
  }

  async markAllAsRead(userId: number): Promise<Notification[]> {
    // Se verifica que exista el usuario antes de marcar las notificaciones como leídas
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser)
      throw new NotFoundException(
        'No se encontró el usuario para marcar las notificaciones como leídas',
      );

    // Se actualizan todas las notificaciones del usuario a leídas
    const updatedNotifications = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    if (!updatedNotifications)
      throw new BadRequestException(
        'No se pudieron marcar las notificaciones como leídas',
      );
    // Se obtienen las notificaciones actualizadas para devolverlas
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
    });
    return notifications;
  }

  async remove(id: number): Promise<Notification> {
    // Se verifica que exista la notificación antes de eliminarla
    const existingNotification = await this.findOne(id);
    if (!existingNotification)
      throw new NotFoundException(
        'No se encontró la notificación para eliminar',
      );
    const deletedNotification =
      await this.prisma.notification.delete({
        where: { id },
      });
    if (!deletedNotification)
      throw new BadRequestException('No se pudo eliminar la notificación');
    return deletedNotification;
  }
}