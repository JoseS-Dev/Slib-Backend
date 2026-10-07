import { BadRequestException, Injectable } from '@nestjs/common';
import type { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class MulterFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  createMulterOptions() {
    const allowedFileTypes = this.configService.get<string[]>(
      'uploads.allowedFileTypes',
    )     || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
    ];
    const maxFileSize =
      this.configService.get<number>('uploads.maxFileSize') || 10485760;
    return {
      storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
          const subfolder = req.headers['x-upload'];
          if (!subfolder || typeof subfolder !== 'string') {
            return cb(
              new BadRequestException(
                'Se requiere el encabezado x-upload para especificar la subcarpeta de destino',
              ),
              '',
            );
          }
          const subfolderPath = this.storageService.getSubfolderPath(subfolder);
          cb(null, subfolderPath);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const generatedFileName = this.storageService.generateUniqueFileName(
            file.originalname,
            file.fieldname,
            file.mimetype,
          );
          cb(null, generatedFileName);
        },
      }),
      limits: { fileSize: maxFileSize },
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback,
      ) => {
        if (!allowedFileTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Tipo de archivo no permitido. Tipos permitidos: ${allowedFileTypes.join(', ')}`,
            ),
          );
        }
        cb(null, true);
      },
    };
  }
}