import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  role: string;
}

/**
 * يسحب بيانات المستخدم من الـ JWT payload المرفق بالـ Request.
 * استخدمه في أي Controller محمي:
 *   @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).user as JwtPayload;
  },
);
