import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable, StreamableFile } from '@nestjs/common';
import type { ApiResponse } from '../../shared/interfaces/api.types.js';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((payload) => {
        // Si el payload es un StreamableFile, no lo envuelvas en ApiResponse
        if (payload instanceof StreamableFile) return payload;

        // Mensajes por defecto según el método HTTP
        const defaultMessages: Record<string, string> = {
          POST: 'Recurso creado exitosamente',
          GET: 'Recurso obtenido exitosamente',
          PUT: 'Recurso actualizado exitosamente',
          PATCH: 'Recurso actualizado exitosamente',
          DELETE: 'Recurso eliminado exitosamente',
        };

        const defaultMessage =
          defaultMessages[request.method] || 'Operación realizada exitosamente';
        const isSuccess =
          response.statusCode >= 200 && response.statusCode < 300;

        // Si el payload es un arreglo directo
        if (Array.isArray(payload)) {
          return {
            success: isSuccess,
            message: defaultMessage,
            data: payload,
          };
        }

        // Si el payload es nulo, primitivo o no es un objeto
        if (!payload || typeof payload !== 'object') {
          return {
            success: isSuccess,
            message: defaultMessage,
            data: payload ?? null,
          };
        }

        // Si es un Objeto, desestructuramos para separar 'data' y 'meta' del resto de propiedades
        const payloadObject = payload as Record<string, any>;
        const {
          message,
          meta,
          total,
          page,
          lastPage,
          limit,
          totalPages,
          data,
          ...rest
        } = payloadObject;

        const finalMessage = message || defaultMessage;

        // Construcción de Meta
        let finalMeta = meta;
        if (!finalMeta && total !== undefined) {
          finalMeta = {
            total,
            ...(page !== undefined && { page }),
            ...(lastPage !== undefined && { lastPage }),
            ...(limit !== undefined && { limit }),
            ...(totalPages !== undefined && { totalPages }),
          };
        }

        let finalData: any;
        if (data !== undefined) {
          finalData = data;
        } else if (Object.keys(rest).length > 0) {
          finalData = rest;
        } else {
          finalData = null;
        }

        return {
          success: isSuccess,
          message: finalMessage,
          data: finalData,
          ...(finalMeta && { meta: finalMeta }),
        };
      }),
    );
  }
}
