import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/root.module.js';
import { MailerModule } from './modules/mailer/mailer.module.js';
import { JwtModuleGlobal } from './modules/jwt/jwt.module.js';
import { SecurityModule } from './modules/security/root.module.js';
import type { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CorrelationMiddleware } from './common/middlewares/correlation.middleware.js';

@Module({
  imports: [
    JwtModuleGlobal,
    PrismaModule,
    MailerModule,
    AuthModule,
    SecurityModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
