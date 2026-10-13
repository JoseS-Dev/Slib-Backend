import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service.js';
import { settings } from '../../../config/settings.config.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { NotificationType } from '../../../../generated/prisma/enums.js';
import {
  NotificationErrorResponse,
  NotificationResponse,
  PaginatedNotificationsResponse,
} from './dto/notification-response.dto.js';

@ApiTags('General - Notificaciones')
@ApiBearerAuth('JWT')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Crear una notificación',
    description:
      'Crea una notificación para un usuario y la emite a través del observable interno (gateway de WebSockets).',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificación creada exitosamente',
    type: NotificationResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo crear la notificación',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario destinatario',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponse> {
    return this.notificationService.create(createNotificationDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Listar notificaciones de un usuario',
    description:
      'Obtiene las notificaciones de un usuario con paginación y, opcionalmente, filtradas por tipo.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    example: 7,
    description: 'Identificador del usuario destinatario',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página (por defecto 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: `Cantidad de registros por página (máx. ${settings.server.maxPagination})`,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    description: 'Filtrar notificaciones por tipo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado paginado de notificaciones',
    type: PaginatedNotificationsResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de paginación inválidos',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario especificado',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findAll(
    @Param(
      'userId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    userId: number,
    @Query(
      'page',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    page: number = 1,
    @Query(
      'limit',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    limit: number = 10,
    @Query('type') type?: NotificationType,
  ): Promise<PaginatedNotificationsResponse> {
    if (page < 1 || limit < 1 || limit > settings.server.maxPagination)
      throw new HttpException(
        'Los parámetros de paginación son inválidos. Asegúrese de que page y limit sean mayores a 0 y que limit no exceda el valor máximo permitido.',
        HttpStatus.BAD_REQUEST,
      );
    return this.notificationService.findAll(userId, page, limit, type);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Obtener una notificación por su identificador',
    description: 'Devuelve una notificación por su id.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la notificación',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación encontrada',
    type: NotificationResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un número entero válido',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la notificación',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ): Promise<NotificationResponse> {
    return this.notificationService.findOne(+id);
  }

  @Patch('mark-all-as-read/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Marcar todas las notificaciones de un usuario como leídas',
    description:
      'Actualiza a `isRead=true` todas las notificaciones no leídas de un usuario y devuelve la lista completa de notificaciones actualizadas.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    example: 7,
    description: 'Identificador del usuario',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificaciones marcadas como leídas',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudieron marcar las notificaciones como leídas',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe el usuario especificado',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async markAllAsRead(
    @Param(
      'userId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    userId: string,
  ): Promise<NotificationResponse[]> {
    return this.notificationService.markAllAsRead(+userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Actualizar una notificación existente',
    description:
      'Permite modificar el título, mensaje, tipo o estado de lectura de una notificación.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la notificación a actualizar',
  })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación actualizada exitosamente',
    type: NotificationResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o no se pudo actualizar la notificación',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la notificación',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponse> {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador', 'Recepcionista', 'Usuario')
  @ApiOperation({
    summary: 'Eliminar una notificación',
    description: 'Elimina una notificación del sistema.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Identificador único de la notificación a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificación eliminada',
    type: NotificationResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No se pudo eliminar la notificación',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró la notificación',
    type: NotificationErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'El rol del usuario no tiene permisos suficientes',
  })
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ): Promise<NotificationResponse> {
    return this.notificationService.remove(+id);
  }
}
