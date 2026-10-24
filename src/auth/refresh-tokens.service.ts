import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity.js';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
    private readonly config: ConfigService,
  ) {}

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private get ttlMs() {
    return Number(this.config.get('REFRESH_TTL_DAYS', 7)) * 24 * 60 * 60 * 1000;
  }

  async issue(userId: string) {
    const token = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + this.ttlMs);

    await this.repo.save(
      this.repo.create({
        userId,
        tokenHash: this.hash(token),
        expiresAt,
      }),
    );

    return { token, expiresAt };
  }

  async revoke(token: string) {
    await this.repo.update(
      { tokenHash: this.hash(token), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeAllForUser(userId: string) {
    await this.repo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async findValidToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hash(token);
    const entity = await this.repo.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
      },
    });

    if (!entity) return null;
    if (new Date() > entity.expiresAt) return null;

    return entity;
  }
}