import type { Response } from 'express';
import { Catch, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '../../../generated/prisma/internal/prismaNamespace.js';

@Catch(PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Realizo el mapeo de los códigos de error de Prisma a códigos de estado HTTP
    switch (exception.code) {
      case 'P2002': {
        const target =
          (exception.meta?.['target'] as string[])?.join(', ') || 'campo';
        response.status(HttpStatus.CONFLICT).json({
          success: false,
          message: `El valor proporcionado para '${target}' ya existe y debe ser único.`,
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case 'P2025': {
        response.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'El recurso que intentas actualizar o eliminar no existe.',
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case 'P2014': {
        response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message:
            'No se puede crear o actualizar el registro debido a una relación faltante.',
          timestamp: new Date().toISOString(),
        });
        break;
      }
      case 'P2003': {
        const target =
          (exception.meta?.['target'] as string[])?.join(', ') || 'campo';
        response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `No se puede crear o actualizar el registro debido a una relación faltante en '${target}'.`,
          timestamp: new Date().toISOString(),
        });
        break;
      }
      default: {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Ocurrió un error inesperado en la base de datos.',
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }
  }
}