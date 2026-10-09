import argon2 from 'argon2';
import crypton from 'crypto';
import { Resend } from 'resend';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { settings } from '../../config/settings.config.js';
import {
  CreateMailerDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/create-mailer.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { compileTemplate } from '../../utils/functions/function.js';

@Injectable()
export class MailerService implements OnModuleInit {
  private resend!: Resend;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    try {
      const apiKey = settings.server.apiKey;
      if (!apiKey)
        throw new Error('La clave de la API de Resend no está configurada');
      this.resend = new Resend(apiKey);
    } catch (error) {
      throw new Error(`Error al inicializar el servicio de correo: ${error}`);
    }
  }

  // Envio del correo de bienvenida y guarda el token de verificación en la base de datos
  async sendWelcomeEmail(createMailerDto: CreateMailerDto) {
    const token = crypton.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    // Se gaurda el token y la fecha de expiración en la base de datos
    await this.prisma.user.update({
      where: { email: createMailerDto.email },
      data: {
        verificationToken: token,
        verificationTokenExpiry: expires,
      },
    });

    // Se contruyen el link de verificación con el token
    const LINK = `${settings.server.corsOrigin}/verify?token=${token}&email=${createMailerDto.email}`;

    // Se compila la plantilla de correo electrónico con el link de verificación
    const html = compileTemplate('welcome', {
      firstName: createMailerDto.firstName,
      lastName: createMailerDto.lastName,
      link: LINK,
      login: `${settings.server.corsOrigin}/login`,
      year: new Date().getFullYear(),
    });

    // Se envia el correo electrónico de bienvenida
    await this.resend.emails.send({
      from: settings.server.emailFrom,
      to: createMailerDto.email,
      subject: 'Bienvenido a SLIB',
      html: html,
    });

    return {
      success: true,
      message: 'Correo de bienvenida enviado correctamente',
    };
  }

  // Método para enviar el correo de establecimiento de contraseña
  async sendSetPasswordEmail(createMailerDto: CreateMailerDto) {
    const token = crypton.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    // Se guarda el token y la fecha de expiración en la base de datos
    await this.prisma.user.update({
      where: { email: createMailerDto.email },
      data: {
        passwordToken: token,
        passwordTokenExpiry: expires,
      },
    });

    // Se construye el link de establecimiento de contraseña con el token
    const LINK = `${settings.server.corsOrigin}/set-password?token=${token}&email=${createMailerDto.email}`;

    // Se compila la plantilla de correo electrónico con el link de establecimiento de contraseña
    const html = compileTemplate('set-password', {
      firstName: createMailerDto.firstName,
      lastName: createMailerDto.lastName,
      link: LINK,
      login: `${settings.server.corsOrigin}/login`,
      year: new Date().getFullYear(),
    });

    // Se envia el correo electrónico de establecimiento de contraseña
    await this.resend.emails.send({
      from: settings.server.emailFrom,
      to: createMailerDto.email,
      subject: 'Establece tu contraseña en SLIB',
      html: html,
    });

    return {
      success: true,
      message: 'Correo de establecimiento de contraseña enviado correctamente',
    };
  }

  // Método para la verificación la cuenta de un usuario a partir del email y el token de recibido por el correo
  async verifyToken(email: string, token: string) {
    const decodedToken = decodeURIComponent(token);
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
        verificationToken: decodedToken,
      },
      select: {
        email: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        verified: true,
      },
    });
    if (!user)
      throw new BadRequestException(
        'Token de verificación inválido o usuario no encontrado',
      );
    if (user.verified)
      throw new BadRequestException('El usuario ya ha sido verificado');
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      throw new BadRequestException('El token de verificación ha expirado');
    }
    // Se marca el usuario como verificado y se eliminan el token y la fecha de expiración
    await this.prisma.user.update({
      where: { email: email },
      data: {
        verified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });
  }

  // Envia un correo de confimarción de cambio de contraseña
  async sendPasswordChangeEmail(data: CreateMailerDto) {
    const html = compileTemplate('password-change', {
      firstName: data.firstName,
      lastName: data.lastName,
      login: `${settings.server.corsOrigin}/login`,
      year: new Date().getFullYear(),
    });

    await this.resend.emails.send({
      from: settings.server.emailFrom,
      to: data.email,
      subject: 'Cambio de contraseña en SLIB',
      html: html,
    });

    return {
      success: true,
      message:
        'Correo de confirmación de cambio de contraseña enviado correctamente',
    };
  }

  // Envia un correo de establecimiento de contraseña exitoso
  async sendPasswordSetEmail(data: CreateMailerDto) {
    const html = compileTemplate('password-set', {
      firstName: data.firstName,
      lastName: data.lastName,
      login: `${settings.server.corsOrigin}/login`,
      year: new Date().getFullYear(),
    });

    await this.resend.emails.send({
      from: settings.server.emailFrom,
      to: data.email,
      subject: 'Contraseña establecida en SLIB',
      html: html,
    });
    return {
      success: true,
      message:
        'Correo de confirmación de establecimiento de contraseña enviado correctamente',
    };
  }

  // Método para enviar el correo de recuperación de contraseña y guarda el token en la base de datos
  async sendForgotPasswordEmail(createMailerDto: ForgotPasswordDto) {
    // Se verifica que el usuario exista
    const user = await this.prisma.user.findUnique({
      where: { email: createMailerDto.email },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const token = crypton.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    // Se guarda el token y la fecha de expiración en la base de datos
    await this.prisma.user.update({
      where: { email: createMailerDto.email },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    });

    // Se construye el link de recuperación de contraseña con el token
    const LINK = `${settings.server.corsOrigin}/reset-password?token=${token}&email=${createMailerDto.email}`;

    // Se compila la plantilla de correo electrónico con el link de recuperación de contraseña
    const html = compileTemplate('forgot-password', {
      firstName: user.firstName,
      lastName: user.lastName,
      link: LINK,
      login: `${settings.server.corsOrigin}/login`,
      year: new Date().getFullYear(),
    });

    // Se envia el correo electrónico de recuperación de contraseña
    await this.resend.emails.send({
      from: settings.server.emailFrom,
      to: createMailerDto.email,
      subject: 'Recuperación de contraseña en SLIB',
      html: html,
    });

    return {
      success: true,
      message: 'Correo de recuperación de contraseña enviado correctamente',
    };
  }

  // Restablece la contraseña de un usuario a partir del token y el correo recibidos
  async resetPassword(data: ResetPasswordDto) {
    // Se verifica que el token y el correo electrónico sean válidos
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        resetToken: data.token,
      },
    });
    if (!user)
      throw new BadRequestException('Token o correo electrónico inválido');

    // Se verifica que el token no haya expirado
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      throw new BadRequestException(
        'El token ha expirado, por favor solicite un nuevo correo de recuperación de contraseña',
      );
    }

    // Se hashea la nueva contraseña
    const hashedPassword = await argon2.hash(data.newPassword);

    // Se actualiza la contraseña del usuario y se eliminan el token y la fecha de expiración
    await this.prisma.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Se envía el correo de confirmación de cambio de contraseña
    await this.sendPasswordChangeEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    return {
      success: true,
      message:
        'Contraseña restablecida correctamente, por favor inicie sesión con su nueva contraseña',
    };
  }

  async setPassword(data: ResetPasswordDto) {
    // Se verifica que el token y el correo electrónico sean válidos
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        passwordToken: data.token,
      },
    });
    if (!user)
      throw new BadRequestException('Token o correo electrónico inválido');

    // Se verifica que el token no haya expirado
    if (user.passwordTokenExpiry && user.passwordTokenExpiry < new Date()) {
      throw new BadRequestException(
        'El token ha expirado, por favor solicite un nuevo correo de establecimiento de contraseña',
      );
    }
    // Se hashea la nueva contraseña
    const hashedPassword = await argon2.hash(data.newPassword);
    // Se actualiza la contraseña del usuario y se eliminan el token y la fecha de expiración
    await this.prisma.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword,
        passwordToken: null,
        passwordTokenExpiry: null,
      },
    });

    await this.sendPasswordSetEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    return {
      success: true,
      message:
        'Contraseña establecida correctamente, por favor inicie sesión con su nueva contraseña',
    };
  }
}
