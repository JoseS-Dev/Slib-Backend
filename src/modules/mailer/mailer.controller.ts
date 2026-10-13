import {
  Controller,
  Post,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MailerService } from './mailer.service.js';
import { settings } from '../../config/settings.config.js';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/create-mailer.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import {
  MailerErrorResponse,
  MailerSuccessResponse,
} from './dto/mailer-response.dto.js';

@ApiTags('Servicio de Correo')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Verificar token de bienvenida',
    description:
      'Verifica el token de activación de cuenta enviado por correo electrónico al usuario tras el registro. ' +
      'Si el token es válido y la cuenta aún no ha sido verificada, marca al usuario como verificado e invalida el token.',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    example: 'juan.perez@correo.com',
    description: 'Dirección de correo electrónico del usuario',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    type: String,
    example: 'a1b2c3d4e5f6...',
    description:
      'Token de verificación recibido en el correo de bienvenida (caducidad: 1 hora)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuenta verificada exitosamente',
    type: MailerSuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Token inválido, expirado, ausente o el usuario ya fue verificado',
    type: MailerErrorResponse,
  })
  async sendWelcome(
    @Query('email') email: string,
    @Query('token') token: string,
  ): Promise<MailerSuccessResponse> {
    if (!email || !token)
      throw new BadRequestException('Email y token son requeridos');
    await this.mailerService.verifyToken(email, token);
    return {
      success: true,
      message: 'Cuenta verificada exitosamente',
    };
  }

  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Establecer contraseña inicial',
    description:
      'Permite a un usuario establecer su contraseña por primera vez a partir del token recibido en el correo de invitación. ' +
      'Si el token es válido, actualiza la contraseña y la confirma por correo.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contraseña establecida correctamente',
    type: MailerSuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token inválido, expirado o datos de la solicitud incorrectos',
    type: MailerErrorResponse,
  })
  async sendSetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MailerSuccessResponse> {
    return (await this.mailerService.setPassword(resetPasswordDto)) as MailerSuccessResponse;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Envía un correo electrónico con un enlace para restablecer la contraseña. ' +
      'El enlace contiene un token con caducidad de 1 hora.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Correo de recuperación enviado (si el usuario existe)',
    type: MailerSuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El usuario no existe o el email no fue proporcionado',
    type: MailerErrorResponse,
  })
  async sendForgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MailerSuccessResponse> {
    return (await this.mailerService.sendForgotPasswordEmail(
      forgotPasswordDto,
    )) as MailerSuccessResponse;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description:
      'Restablece la contraseña de un usuario a partir del token y el correo recibidos en el correo de recuperación. ' +
      'Si el token es válido, actualiza la contraseña, invalida el token y envía una confirmación por correo.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contraseña restablecida correctamente',
    type: MailerSuccessResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token inválido, expirado o datos de la solicitud incorrectos',
    type: MailerErrorResponse,
  })
  async sendResetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MailerSuccessResponse> {
    return (await this.mailerService.resetPassword(resetPasswordDto)) as MailerSuccessResponse;
  }
}
