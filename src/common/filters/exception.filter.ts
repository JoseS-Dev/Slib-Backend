import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class exceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinó el estado de la respuesta
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Luego extrae el mensaje de error
    let message: string | object = 'Error Interno del Servidor';

    if (exception instanceof HttpException) {
      const responseData = exception.getResponse();
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (typeof responseData === 'object' && responseData !== null) {
        const rawMessage = (responseData as Record<string, any>)['message'];
        if (Array.isArray(rawMessage)) {
          message = rawMessage.join(', ');
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else {
          message = exception.message;
        }
      }
    }

    // Finalmente, envía la respuesta de error
    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}