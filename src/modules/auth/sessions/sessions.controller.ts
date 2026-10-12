import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SessionsService } from './sessions.service.js';
import type { SessionPayload } from './sessions.constants.js';
import { settings } from '../../../config/settings.config.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { User } from '../../../common/decorators/user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import {
  cookieOptions,
  refreshCookieOptions,
} from '../../../utils/cookies/cookie.utils.js';
import {
  AuthErrorResponse,
  ForbiddenAuthResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  VerifySessionResponse,
} from './dto/session-response.dto.js';

@ApiTags('Autenticación - Sesiones')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario con email y contraseña. Devuelve un JWT de acceso en el cuerpo y los tokens (access y refresh) en cookies httpOnly. ' +
      'Tras un login exitoso, todas las sesiones y refresh tokens activos del usuario son revocados.',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Inicio de sesión exitoso',
    type: LoginResponse,
    headers: {
      'Set-Cookie': {
        description:
          'Cookies httpOnly con los tokens de acceso y refresco. ' +
          `Nombres: ${settings.security.cookieName} (refresh) y ${settings.security.cookieName}-access (access).`,
        schema: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de inicio de sesión inválidos',
    type: AuthErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Contraseña incorrecta, usuario bloqueado o no verificado',
    type: ForbiddenAuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe un usuario con el correo proporcionado',
    type: AuthErrorResponse,
  })
  async login(
    @Body() CreateSessionDto: CreateSessionDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    const { data, accessToken, refreshToken } =
      await this.sessionsService.login(CreateSessionDto);
    res.cookie(
      `${settings.security.cookieName}`,
      refreshToken,
      refreshCookieOptions,
    );
    res.cookie(
      `${settings.security.cookieName}-access`,
      accessToken,
      cookieOptions,
    );
    return {
      ...data,
      accessToken,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(settings.security.cookieName)
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description:
      'Genera un nuevo par de tokens (access y refresh) a partir del refresh token almacenado en la cookie. ' +
      'El refresh token anterior queda revocado (rotación de tokens).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refrescados exitosamente',
    type: RefreshTokenResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de refresh ausente, inválido, revocado o expirado',
    type: AuthErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario asociado al token no encontrado',
    type: AuthErrorResponse,
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenResponse> {
    const rawRefreshToken = req.cookies[settings.security.cookieName];
    const { accessToken, refreshToken } =
      await this.sessionsService.refreshToken(rawRefreshToken);
    res.cookie(
      `${settings.security.cookieName}`,
      refreshToken,
      refreshCookieOptions,
    );
    res.cookie(
      `${settings.security.cookieName}-access`,
      accessToken,
      cookieOptions,
    );
    return { accessToken, refreshToken };
  }

  @Post('logout')
  @ApiBearerAuth('JWT')
  @ApiCookieAuth(settings.security.cookieName)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Cierra la sesión activa del usuario autenticado: desactiva la sesión y revoca los refresh tokens pendientes. Limpia las cookies de autenticación.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sesión cerrada exitosamente',
    type: LogoutResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
    type: AuthErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró una sesión activa para el usuario',
    type: AuthErrorResponse,
  })
  async logout(
    @User() user: SessionPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponse> {
    res.clearCookie(`${settings.security.cookieName}`, refreshCookieOptions);
    res.clearCookie(`${settings.security.cookieName}-access`, cookieOptions);
    return this.sessionsService.logout(user.sub);
  }

  @Get('verify')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar sesión activa',
    description:
      'Devuelve los datos del usuario extraídos del token JWT si la sesión es válida.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La sesión es válida',
    type: VerifySessionResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido',
    type: AuthErrorResponse,
  })
  async verify(@User() user: SessionPayload): Promise<VerifySessionResponse> {
    return {
      message: 'Sesión válida',
      isAuthenticated: true,
      user: user,
    };
  }
}
