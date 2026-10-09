import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import type { SessionPayload } from '../sessions.constants.js';
import { settings } from '../../../../config/settings.config.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IS_PUBLIC_KEY } from '../../../../common/decorators/public.decorator.js';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  // Método privado para extraer el token de la cabecera
  private extractToken(req: Request): string | null {
    if (req.cookies && req.cookies[settings.security.cookieName]) {
      return req.cookies[settings.security.cookieName];
    }
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);
    if (!token)
      throw new UnauthorizedException(
        'No se proporcionó un token de sesión válido',
      );

    let payload: any;
    try {
      payload = await this.jwtService.verify(token, {
        secret: settings.security.jwtSecret,
        algorithms: [settings.security.jwtAlgorithm],
      });
    } catch (error) {
      throw new UnauthorizedException('Token de sesión inválido o expirado');
    }

    // Se verifica que el usuario tenga una sesión activa en la base de datos
    const userId = payload.sub;
    const session = await this.prisma.session.findFirst({
      where: { userId: userId, isActive: true },
    });

    // Se verifica que el refresh token no este revocado ni expirado
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        sessionId: session?.id,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!session || !refreshToken) {
      throw new UnauthorizedException(
        'No se encontró una sesión activa para el usuario',
      );
    }
    // Se inyecta la información del usuario y la sesión en el request para que esté disponible en los controladores
    req['user'] = payload as SessionPayload;
    return true;
  }
}
