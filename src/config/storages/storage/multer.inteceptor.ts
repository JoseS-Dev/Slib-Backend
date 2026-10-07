import multer from 'multer';
import { Observable } from 'rxjs';
import { MulterFactory } from '../factory/multer.factory.js';
import { BadRequestException, Injectable } from '@nestjs/common';
import type {CallHandler, ExecutionContext, NestInterceptor} from '@nestjs/common';

@Injectable()
export class MulterInterceptor implements NestInterceptor {
  constructor(private readonly multerFactory: MulterFactory) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    // Se obtiene la configuración de multer
    const multerOptions = this.multerFactory.createMulterOptions();
    const upload = multer(multerOptions).single('file');

    await new Promise((resolve, reject) => {
      upload(req, req.res, (err) => {
        if (err) {
          reject(
            new BadRequestException(
              `Error al subir el archivo: ${err.message}`,
            ),
          );
        } else {
          resolve(true);
        }
      });
    });

    return next.handle();
  }
}