import { fakerES as faker } from '@faker-js/faker';
import type { Notification, User } from '../../../generated/prisma/client.js';
import { NotificationType } from '../../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';

interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
}

// Plantillas alineadas con el enum `NotificationType` del schema.
const TEMPLATES: ReadonlyArray<NotificationTemplate> = [
  {
    type: NotificationType.BIENVENIDA,
    title: '¡Bienvenido a SLIB!',
    message:
      'Tu cuenta ha sido creada correctamente. Explora el catálogo y comienza a reservar.',
  },
  {
    type: NotificationType.SOLICITUD_CREADA,
    title: 'Solicitud registrada',
    message:
      'Hemos recibido tu solicitud de préstamo. Te avisaremos cuando sea revisada.',
  },
  {
    type: NotificationType.SOLICITUD_APROBADA,
    title: 'Tu solicitud fue aprobada',
    message:
      'La solicitud fue aprobada. Puedes pasar por mostrador a retirar el ejemplar.',
  },
  {
    type: NotificationType.SOLICITUD_RECHAZADA,
    title: 'Solicitud rechazada',
    message:
      'Lamentablemente tu solicitud no pudo ser aprobada. Revisa tu historial para más detalles.',
  },
  {
    type: NotificationType.PRESTAMO_REGISTRADO,
    title: 'Préstamo registrado',
    message:
      'Se registró un préstamo a tu nombre. Recuerda devolverlo antes de la fecha límite.',
  },
  {
    type: NotificationType.RECORDATORIO_DEVOLUCION,
    title: 'Recordatorio de devolución',
    message:
      'Tu préstamo está próximo a vencer. Devuélvelo a tiempo para evitar multas.',
  },
  {
    type: NotificationType.PRESTAMO_VENCIDO,
    title: 'Préstamo vencido',
    message:
      'Tu préstamo ha superado la fecha límite. Devuélvelo cuanto antes para evitar sanciones.',
  },
  {
    type: NotificationType.DEVOLUCION_COMPLETADA,
    title: 'Devolución completada',
    message:
      'Gracias por devolver el ejemplar. ¡Esperamos que lo hayas disfrutado!',
  },
  {
    type: NotificationType.MULTA_GENERADA,
    title: 'Multa generada',
    message:
      'Se ha generado una multa asociada a tu cuenta. Consulta el detalle en tu perfil.',
  },
  {
    type: NotificationType.SUSPENSION_APLICADA,
    title: 'Cuenta suspendida',
    message:
      'Tu cuenta ha sido suspendida temporalmente. Contacta con recepción para más información.',
  },
  {
    type: NotificationType.INCIDENCIA_REPORTADA,
    title: 'Incidencia reportada',
    message:
      'Hemos registrado tu incidencia. El equipo la revisará en los próximos días.',
  },
  {
    type: NotificationType.INCIDENCIA_ACTUALIZADA,
    title: 'Incidencia actualizada',
    message:
      'El administrador ha respondido a tu incidencia. Revisa los detalles.',
  },
  {
    type: NotificationType.NUEVO_LIBRO_REGISTRADO,
    title: 'Nuevo libro disponible',
    message: 'Acaba de llegar un nuevo título al catálogo. ¡Échale un vistazo!',
  },
];

export class NotificationsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea notificaciones para los usuarios a partir de las plantillas del enum
   * `NotificationType`. Es idempotente por (userId, title).
   */
  async run(users: User[]): Promise<Notification[]> {
    const created: Notification[] = [];
    if (users.length === 0) return created;

    for (const user of users) {
      const count = faker.number.int({ min: 1, max: 4 });
      const picked = faker.helpers.arrayElements(
        TEMPLATES,
        Math.min(count, TEMPLATES.length),
      );

      for (const template of picked) {
        const existing = await this.prisma.notification.findFirst({
          where: { userId: user.id, title: template.title },
        });
        if (existing) {
          created.push(existing);
          continue;
        }

        const notification = await this.prisma.notification.create({
          data: {
            userId: user.id,
            title: template.title,
            message: template.message,
            typeNotification: template.type,
            isRead: faker.datatype.boolean({ probability: 0.45 }),
          },
        });
        created.push(notification);
      }
    }

    return created;
  }

  async clear(): Promise<number> {
    const deleted = await this.prisma.notification.deleteMany({});
    return deleted.count;
  }
}
