import { ZodError } from 'zod';
import type { Request, Response } from 'express';
import { Catch, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

@Catch(ZodError)
export class ZodValidationFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extraigo los errores de validación de Zod
    const validationErrors = exception.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    // Envío la respuesta de error
    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Error de validación',
      errors: validationErrors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}