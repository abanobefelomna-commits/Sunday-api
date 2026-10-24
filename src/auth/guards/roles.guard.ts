import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { Role } from '../../users/role.enum.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // لو مفيش @Roles() محدد، يعدي لأي مستخدم مسجل دخول
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user?.role) {
      throw new ForbiddenException('مش مسموح لك بالوصول');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('مش مسموح لك بالوصول');
    }

    return true;
  }
}
