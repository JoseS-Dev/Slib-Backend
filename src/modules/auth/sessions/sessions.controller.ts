import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
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

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Body() CreateSessionDto: CreateSessionDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
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
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @User() user: SessionPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie(`${settings.security.cookieName}`, refreshCookieOptions);
    res.clearCookie(`${settings.security.cookieName}-access`, cookieOptions);
    return this.sessionsService.logout(user.sub);
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@User() user: SessionPayload) {
    return {
      message: 'Sesión válida',
      isAuthenticated: true,
      user: user,
    };
  }
}
