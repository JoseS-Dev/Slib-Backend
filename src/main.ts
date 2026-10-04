import morgan from 'morgan';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ZodValidationPipe } from 'nestjs-zod';
import { settings } from './config/settings.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: settings.server.nodeEnv
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix(settings.server.basePath);
  app.useGlobalPipes(new ZodValidationPipe());

  app.enableCors({
    origin: settings.server.corsOrigin,
    methods: settings.server.methodsAllowed.split(','),
    credentials: true,
  });
  app.use(helmet());
  app.use(morgan(settings.server.nodeEnv 
  === 'production' ? 'combined' : 'dev'));
  app.use(cookieParser())

  await app.listen(settings.server.port, () => {
    logger.log(
      `Servidor conectado en http://localhost:${settings.server.port}${settings.server.basePath}`,
    )
  })
  
}

bootstrap().catch((error) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exit(1);
});
