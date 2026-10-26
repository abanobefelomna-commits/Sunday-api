import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  THROTTLE_RULE_METADATA,
  type ThrottleRule,
} from '../decorators/throttle.decorator.js';

interface RateLimitWindow {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, RateLimitWindow>();
  private requestCount = 0;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const rule =
      this.reflector.getAllAndOverride<ThrottleRule>(
        THROTTLE_RULE_METADATA,
        [context.getHandler(), context.getClass()],
      ) ?? { limit: 100, ttl: 60_000 };

    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const route = request.route?.path ?? request.path;
    const key = `${ip}:${request.baseUrl}:${route}`;

    const now = Date.now();
    let window = this.windows.get(key);

    if (!window || window.expiresAt <= now) {
      window = {
        count: 0,
        expiresAt: now + rule.ttl,
      };

      this.windows.set(key, window);
    }

    if (window.count >= rule.limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    window.count += 1;

    // تنظيف النوافذ المنتهية دوريًا لتقليل استهلاك الذاكرة.
    this.requestCount += 1;

    if (this.requestCount % 100 === 0) {
      for (const [storedKey, storedWindow] of this.windows) {
        if (storedWindow.expiresAt <= now) {
          this.windows.delete(storedKey);
        }
      }
    }

    return true;
  }
}