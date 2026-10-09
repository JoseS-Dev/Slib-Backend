import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir =
      this.configService.get<string>('uploads.uploadsDir') || 'uploads';
  }

  private readonly mimeToExtMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/svg+xml': ['.svg'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
  };

  // Método para asegurarse de que el directorio de uploads existe
  private ensureUploadsDirExists() {
    const fullPath = path.resolve(this.uploadsDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  // Método privado para validar el mimeType de un archivo
  private validateAndSanitizedExtension(
    orginalName: string,
    mimeType: string,
  ): string | null {
    const ext = path.extname(orginalName).toLowerCase();
    const allowedExtensions =
      this.configService.get<string[]>('uploads.allowedExtensions') || [];

    if (!allowedExtensions.includes(ext)) {
      return null;
    }

    const expectedExtensions = this.mimeToExtMap[mimeType] || [];
    if (!expectedExtensions.includes(ext)) {
      return null;
    }

    return ext;
  }

  getMimeType(fileName: string): string | null {
    const ext = path.extname(fileName).toLowerCase();
    for (const [mime, extensions] of Object.entries(this.mimeToExtMap)) {
      if (extensions.includes(ext)) {
        return mime;
      }
    }
    return null;
  }

  // Método para obtener la ruta completa de la carpeta
  getUplodasDirPath(): string {
    this.ensureUploadsDirExists();
    return path.join(process.cwd(), this.uploadsDir);
  }

  // Método para obtener la ruta completa de la subcarpeta dentro de la carpeta de uploads
  getSubfolderPath(subfolder: string): string {
    this.ensureUploadsDirExists();
    const fullPath = path.join(process.cwd(), this.uploadsDir, subfolder ?? '');
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }

  // Método para obtener la ruta completa de un archivo específico dentro de la carpeta de uploads
  getFilePath(fileName: string): string {
    this.ensureUploadsDirExists();
    return path.join(process.cwd(), this.uploadsDir, fileName);
  }

  // Método para obtener la ruta relativa de un archivo dentro de una subcarpeta (para persistir en BD)
  getRelativeFilePathInSubfolder(subfolder: string, fileName: string): string {
    return path.posix.join(subfolder ?? '', fileName);
  }

  // Método para obtener la ruta completa de un archivo específico dentro de una subcarpeta de la carpeta de uploads
  getFilePathInSubfolder(subfolder: string, fileName: string): string {
    this.ensureUploadsDirExists();
    return path.join(process.cwd(), this.uploadsDir, subfolder ?? '', fileName);
  }

  // Método para resolver la ruta absoluta de un archivo guardado en BD (ruta relativa a uploads/), si existe en disco
  resolveStoredFilePath(storedPath: string): string | null {
    const fullPath = path.join(process.cwd(), this.uploadsDir, storedPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    return null;
  }

  // Método para generar un nombre de archivo único basado en la fecha y hora actual
  generateUniqueFileName(
    originalName: string,
    fieldName: string,
    mimeType?: string,
  ): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeExt =
      this.validateAndSanitizedExtension(originalName, mimeType || '') ||
      path.extname(originalName).toLowerCase();
    return `${fieldName}-${uniqueSuffix}${safeExt}`;
  }
}
