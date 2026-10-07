import { 
  Controller, 
  Post, 
  Query,
  Body,
  BadRequestException
} from '@nestjs/common';
import { MailerService } from './mailer.service.js';
import { settings } from '../../config/settings.config.js';
import { ResetPasswordDto } from './dto/create-mailer.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('welcome')
  @Public()
  async sendWelcome(
    @Query('email') email: string,
    @Query('token') token: string
  ){
    if(!email || !token) throw new BadRequestException('Email y token son requeridos');
    return this.mailerService.verifyToken(email, token);
  }

  @Post('set-password')
  @Public()
  async sendSetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ){
    return this.mailerService.setPassword(resetPasswordDto);
  }

  @Post('forgot-password')
  @Public()
  async sendForgotPassword(
    @Body('email') email: string
  ){
    if(!email) throw new BadRequestException('Email es requerido');
    return this.mailerService.sendForgotPasswordEmail({email});
  }

  @Post('reset-password')
  @Public()
  async sendResetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ){
    return this.mailerService.resetPassword(resetPasswordDto);
  }
}
