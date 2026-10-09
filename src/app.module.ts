import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/root.module.js';
import uploadsConfig from './config/storages/uploads.config.js';
import { MailerModule } from './modules/mailer/mailer.module.js';
import { JwtModuleGlobal } from './modules/jwt/jwt.module.js';
import { BooksModule } from './modules/books/root.module.js';
import { GeneralModule } from './modules/general/root.module.js';
import { RequestsModule } from './modules/requests/root.module.js';
import { SecurityModule } from './modules/security/root.module.js';
import { CategoriesModule } from './modules/categories/root.module.js';
import type { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { StorageModule } from './config/storages/storage/storage.module.js';
import { CorrelationMiddleware } from './common/middlewares/correlation.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [uploadsConfig],
    }),
    StorageModule,
    JwtModuleGlobal,
    PrismaModule,
    MailerModule,
    AuthModule,
    SecurityModule,
    CategoriesModule,
    BooksModule,
    RequestsModule,
    GeneralModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
