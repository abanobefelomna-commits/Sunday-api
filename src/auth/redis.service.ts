
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: ReturnType<typeof createClient>;

  constructor(private readonly config: ConfigService) {
    this.client = createClient({
      url: this.config.get<string>(
        'REDIS_URL',
        'redis://127.0.0.1:6379',
      ),
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    await this.client.ping();
    this.logger.log('Connected to Redis');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  private validateTtl(ttlSeconds: number): void {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
      throw new Error('Redis TTL must be a positive integer');
    }
  }

  async storeOtpHash(
    codeKey: string,
    attemptsKey: string,
    codeHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    this.validateTtl(ttlSeconds);

    // استبدال الكود السابق ومسح عداد محاولاته بصورة ذرية.
    await this.client
      .multi()
      .set(codeKey, codeHash, { EX: ttlSeconds })
      .del(attemptsKey)
      .exec();
  }

  async verifyOtpHash(
    codeKey: string,
    attemptsKey: string,
    submittedHash: string,
    maxAttempts: number,
    ttlSeconds: number,
  ): Promise<number> {
    this.validateTtl(ttlSeconds);

    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
      throw new Error('OTP_MAX_ATTEMPTS must be a positive integer');
    }

    // النتيجة:
    //  1 = صحيح وتم استهلاك الكود.
    //  0 = الكود غير صحيح.
    // -1 = الكود غير موجود أو انتهت صلاحيته.
    // -2 = تم استنفاد المحاولات.
    const script = `
      local storedHash = redis.call('GET', KEYS[1])

      if not storedHash then
        return -1
      end

      local attempts = redis.call('INCR', KEYS[2])

      if attempts == 1 then
        redis.call('EXPIRE', KEYS[2], ARGV[2])
      end

      local maxAttempts = tonumber(ARGV[1])

      if attempts > maxAttempts then
        redis.call('DEL', KEYS[1], KEYS[2])
        return -2
      end

      if storedHash ~= ARGV[3] then
        if attempts >= maxAttempts then
          redis.call('DEL', KEYS[1], KEYS[2])
          return -2
        end

        return 0
      end

      redis.call('DEL', KEYS[1], KEYS[2])
      return 1
    `;

    const result = await this.client.eval(script, {
      keys: [codeKey, attemptsKey],
      arguments: [
        String(maxAttempts),
        String(ttlSeconds),
        submittedHash,
      ],
    });

    return Number(result);
  }

  async deleteKeys(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    return this.client.del(keys);
  }
}
