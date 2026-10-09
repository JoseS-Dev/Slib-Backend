import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { extractToken } from '../../../utils/functions/function.js';
import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { settings } from '../../../config/settings.config.js';
import { NotificationService } from './notification.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: settings.server.corsOrigin,
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private server!: Server;

  // Logger
  private readonly logger = new Logger(NotificationGateway.name);

  // Un usuario puede tener varias conexiones abiertas
  private userConnections: Map<number, Set<string>> = new Map();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Se suscribe al observable de notificaciones una vez que el servidor WebSocket está inicializado
  afterInit(): void {
    this.notificationService
      .getNotificationsObservable()
      .subscribe((notification) => {
        this.server
          .to(`room-${notification.userId}`)
          .emit('notification', notification);
      });
  }

  // Método privado para colocar a un usuario en una sala de notificaciones
  private joinUserRoom(client: Socket, userId: number) {
    client.join(`room-${userId}`);
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(client.id);
  }

  async handleConnection(client: Socket) {
    try {
      const token = extractToken(client);
      const payload = this.jwtService.verify(token, {
        secret: settings.security.jwtSecret,
      });
      const userId = payload.sub;
      // Se valida si el ususario tiene una sesión activa en la base de datos
      const session = await this.prisma.session.findFirst({
        where: {
          userId: userId,
          isActive: true,
        },
      });
      if (!session) {
        throw new UnauthorizedException(
          'No se encontró una sesión activa para el usuario',
        );
      }
      client.data.userId = userId;
      this.joinUserRoom(client, userId);
      this.logger.log(
        `Usuario ${userId} conectado con socket ID: ${client.id}`,
      );
    } catch (error) {
      this.logger.error(`Error al conectar el socket: ${error}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userConnections.has(userId)) {
      this.userConnections.get(userId)!.delete(client.id);
      if (this.userConnections.get(userId)!.size === 0) {
        this.userConnections.delete(userId);
      }
    }
    this.logger.log(
      `Usuario ${userId} desconectado con socket ID: ${client.id}`,
    );
  }
}