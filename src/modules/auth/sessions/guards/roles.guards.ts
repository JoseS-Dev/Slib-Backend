import { Reflector } from '@nestjs/core';
import { Injectable, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ROLES_KEY } from '../../../../common/decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException(`El usuario no tiene un rol asignado`);
    }
    const userRoleName =
      typeof user.role === 'string' ? user.role : user.role.name;
    const hasRoles = requiredRoles.includes(userRoleName);
    if (!hasRoles) {
      throw new ForbiddenException(
        `El usuario no tiene los roles requeridos para acceder a este recurso`,
      );
    }
    return true;
  }
}
