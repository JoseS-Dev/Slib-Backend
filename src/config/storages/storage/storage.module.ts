import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { MulterFactory } from '../factory/multer.factory.js';
import { MulterInterceptor } from './multer.inteceptor.js';

@Global()
@Module({
  providers: [StorageService, MulterFactory, MulterInterceptor],
  exports: [StorageService, MulterFactory, MulterInterceptor],
})
export class StorageModule {}