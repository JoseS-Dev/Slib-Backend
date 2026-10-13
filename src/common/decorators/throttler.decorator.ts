import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerRequest, ThrottlerLimitDetail } from '@nestjs/throttler';
import type { ExecutionContext } from '@nestjs/common';
import { settings } from '../../config/settings.config.js';

@Injectable()
export class AutoThrottlerGuard extends ThrottlerGuard {
  override async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, throttler } = requestProps;
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const throttlerName = throttler.name;

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    if (throttlerName === 'reads' && method !== 'GET') {
      return true;
    }

    if (throttlerName === 'writes' && method === 'GET') {
      return true;
    }

    if (throttlerName === 'login') {
      const isLoginRoute =
        controllerName === 'SessionsController' &&
        handlerName === 'login' &&
        method === 'POST';
      if (!isLoginRoute) {
        return true;
      }
    }

    if (throttlerName === 'email') {
      const isMailerRoute = controllerName === 'MailerController';
      if (!isMailerRoute) {
        return true;
      }
    }

    request.__throttlerName = throttlerName;

    return super.handleRequest(requestProps);
  }

  protected override async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    const request = context.switchToHttp().getRequest();
    const throttlerName: string = request.__throttlerName;

    const messages: Record<string, string> = {
      reads: settings.rateLimit.messageRead,
      writes: settings.rateLimit.messageWrite,
      login: settings.rateLimit.messageLogin,
      email: settings.rateLimit.messageEmail,
    };

    return (
      messages[throttlerName] ??
      'Demasiadas solicitudes, por favor intente nuevamente más tarde.'
    );
  }
}