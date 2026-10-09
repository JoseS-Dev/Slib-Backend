import argon2 from 'argon2';
import crypton from 'crypto';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Session } from './entities/session.entity.js';
import { settings } from '../../../config/settings.config.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Función para generar el token
  private async generateToken(
    user: { id: number; email: string; role: string },
    sessionId: number,
  ) {
    const accessTokenJti = crypton.randomBytes(16).toString('hex');
    const refreshTokenJti = crypton.randomBytes(16).toString('hex');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, jti: accessTokenJti },
      { expiresIn: settings.security.jwtExpiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, jti: refreshTokenJti },
      { expiresIn: settings.security.jwtRefreshExpiresIn },
    );

    // Se hashea el token de refresco para guardarlo en la base de datos
    const hashedRefreshToken = crypton
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + settings.security.jwtRefreshExpiresIn * 1000,
    );

    // Se crea el refresh token en la base de datos
    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenJti,
        sessionId,
        token: hashedRefreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async login(
    createSessionDto: CreateSessionDto,
  ): Promise<{ data: Session; accessToken: string; refreshToken: string }> {
    // Se verifica que exista el usuario
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { email: createSessionDto.email },
      include: {
        role: true,
      },
    });
    if (!existingUser)
      throw new NotFoundException('No existe el usuario especificado');
    if (existingUser.lockedUntil) {
      const now = new Date();
      if (existingUser.lockedUntil > now) {
        const minutesRemaining = Math.ceil(
          (existingUser.lockedUntil.getTime() - now.getTime()) / 60000,
        );
        throw new ForbiddenException(
          `El usuario está bloqueado. Intente nuevamente en ${minutesRemaining} minutos.`,
        );
      }
    }

    // Se veriifica que la contraseña sea correcat y que el usuario esté verificado
    const isPasswordValid = await argon2.verify(
      existingUser.password,
      createSessionDto.password,
    );
    if (!existingUser.verified)
      throw new ForbiddenException('El usuario no está verificado');
    if (!isPasswordValid) {
      const newAttempts = (existingUser.failedLoginAttempts || 0) + 1;
      let newLockedUntil: Date | null = null;
      if (newAttempts >= settings.rateLimit.maxFailedLoginAttempts) {
        newLockedUntil = new Date();
        newLockedUntil.setMinutes(
          newLockedUntil.getMinutes() + settings.rateLimit.lockTimeMinutes,
        );
      }
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil: newLockedUntil,
        },
      });
      if (newLockedUntil) {
        throw new ForbiddenException(
          `El usuario ha sido bloqueado debido a múltiples intentos fallidos. Intente nuevamente en ${settings.rateLimit.lockTimeMinutes} minutos.`,
        );
      }
      const remainingAttempts =
        settings.rateLimit.maxFailedLoginAttempts - newAttempts;
      throw new ForbiddenException(
        `Contraseña incorrecta. Le quedan ${remainingAttempts} intentos antes de que su cuenta sea bloqueada.`,
      );
    }

    // Al iniciar sesión se revocan explicitamente las sesiones y los tokens de refresh del usuario
    await this.prisma.session.updateMany({
      where: { userId: existingUser.id, isActive: true },
      data: { isActive: false },
    });

    await this.prisma.refreshToken.updateMany({
      where: {
        session: { userId: existingUser.id },
        expiresAt: { gt: new Date() },
      },
      data: { isRevoked: true },
    });

    const newSession = await this.prisma.session.create({
      data: {
        userId: existingUser.id,
        isActive: true,
      },
    });
    const { accessToken, refreshToken } = await this.generateToken(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role.name,
      },
      newSession.id,
    );
    return { data: newSession, accessToken, refreshToken };
  }

  async refreshToken(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: number; jti: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        algorithms: [settings.security.jwtAlgorithm],
      });
    } catch (error) {
      throw new UnauthorizedException('Tken de refresh Invalido');
    }

    // Se verifica que el token de refresh exista en la base de datos y que no esté revocado ni expirado
    const storedRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: {
        session: true,
      },
    });
    if (
      !storedRefreshToken ||
      !storedRefreshToken.session.isActive ||
      storedRefreshToken.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException(
        'Token de refresh inválido o sesión inactiva',
      );
    }

    // Se verifica que el hash del token presentado coincida con el almacenado
    const hashedRefreshToken = crypton
      .createHash('sha256')
      .update(rawRefreshToken)
      .digest('hex');

    if (storedRefreshToken.token !== hashedRefreshToken) {
      throw new UnauthorizedException('Token de refresh inválido');
    }

    if (storedRefreshToken.isRevoked) {
      await this.prisma.session.update({
        where: { id: storedRefreshToken.sessionId },
        data: { isActive: false },
      });
      await this.prisma.refreshToken.updateMany({
        where: { id: storedRefreshToken.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Token de refresh revocado. Se han revocado todas las sesiones activas',
      );
    }

    await this.prisma.refreshToken.update({
      where: { id: storedRefreshToken.id },
      data: { isRevoked: true },
    });

    // Se genera un nuevo token de refresh y un nuevo token de acceso
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { accessToken, refreshToken } = await this.generateToken(
      { id: user.id, email: user.email, role: user.role.name },
      storedRefreshToken.sessionId,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: number): Promise<{ message: string }> {
    // Se verifica que exista el usuario y la sesión
    const [existingUser, activeSession] = await Promise.all([
      this.prisma.extended.user.findUnique({ where: { id: userId } }),
      this.prisma.session.findFirst({
        where: { userId: userId, isActive: true },
      }),
    ]);
    if (!existingUser) throw new NotFoundException('Usuario no encontrado');
    if (!activeSession)
      throw new NotFoundException('Sesión activa no encontrada');

    await this.prisma.session.update({
      where: { id: activeSession.id },
      data: { isActive: false },
    });

    await this.prisma.refreshToken.updateMany({
      where: { sessionId: activeSession.id, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Sesión cerrada correctamente' };
  }
}
