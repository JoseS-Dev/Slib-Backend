import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { correlationContext } from '../../utils/context/correlation.context.js';
import type { NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const store = correlationContext.getStore();

    const { method, originalUrl } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        this.logger.log(
          `${store?.correlationId} ${method} ${originalUrl} ${statusCode} - +${duration}ms`,
        );
      }),
    );
  }
}