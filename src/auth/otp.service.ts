import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt } from 'node:crypto';
import { RedisService } from './redis.service.js';
import { OtpPurpose } from './otp-purpose.enum.js';

@Injectable()
export class OtpService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  private hashCode(code: string): string {
    const secret = this.config.get<string>('OTP_SECRET');

    if (!secret || secret.length < 32) {
      throw new Error('OTP_SECRET must contain at least 32 characters');
    }

    return createHmac('sha256', secret)
      .update(code)
      .digest('hex');
  }

  private get ttlSeconds(): number {
    const minutes = Number(this.config.get('OTP_TTL_MINUTES', 10));

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 30) {
      throw new Error('OTP_TTL_MINUTES must be between 1 and 30');
    }

    return minutes * 60;
  }

  private get maxAttempts(): number {
    const attempts = Number(this.config.get('OTP_MAX_ATTEMPTS', 5));

    if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) {
      throw new Error('OTP_MAX_ATTEMPTS must be between 1 and 10');
    }

    return attempts;
  }

  private getKeys(userId: string, purpose: OtpPurpose) {
    const prefix = `sunday-school:otp:${purpose}:${userId}`;

    return {
      codeKey: `${prefix}:code`,
      attemptsKey: `${prefix}:attempts`,
    };
  }

  async createCode(userId: string, purpose: OtpPurpose) {
    const code = randomInt(0, 1_000_000)
      .toString()
      .padStart(6, '0');

    const { codeKey, attemptsKey } = this.getKeys(userId, purpose);
    const ttlSeconds = this.ttlSeconds;

    await this.redis.storeOtpHash(
      codeKey,
      attemptsKey,
      this.hashCode(code),
      ttlSeconds,
    );

    return {
      code,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  async verifyCode(
    userId: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<void> {
    if (!/^\d{6}$/.test(code)) {
      throw new BadRequestException('كود التحقق يجب أن يتكون من 6 أرقام');
    }

    const { codeKey, attemptsKey } = this.getKeys(userId, purpose);

    const result = await this.redis.verifyOtpHash(
      codeKey,
      attemptsKey,
      this.hashCode(code),
      this.maxAttempts,
      this.ttlSeconds,
    );

    if (result === 1) return;

    if (result === -2) {
      throw new UnauthorizedException(
        'تم استنفاد محاولات التحقق، اطلب كودًا جديدًا',
      );
    }

    if (result === -1) {
      throw new BadRequestException(
        'الكود غير موجود أو انتهت صلاحيته، اطلب كودًا جديدًا',
      );
    }

    throw new BadRequestException('كود التحقق غير صحيح');
  }

  async invalidateCode(userId: string, purpose: OtpPurpose) {
    const { codeKey, attemptsKey } = this.getKeys(userId, purpose);
    await this.redis.deleteKeys(codeKey, attemptsKey);
  }
}