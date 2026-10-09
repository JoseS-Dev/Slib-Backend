import { registerAs } from '@nestjs/config';
import { settings } from '../settings.config.js';

export default registerAs('uploads', () => ({
  uploadsDir: settings.uploads.uploadsDir,
  maxFileSize: settings.uploads.maxFileSize,
  allowedFileTypes: settings.uploads.allowedFileTypes,
  allowedFileExtensions: settings.uploads.allowedFileExtensions,
}));
