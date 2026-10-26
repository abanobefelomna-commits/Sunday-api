import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module.js';
import { ServantsModule } from '../servants/servants.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RefreshToken } from './refresh-token.entity.js';
import { RefreshTokensService } from './refresh-tokens.service.js';
import { RedisService } from './redis.service.js';
import { OtpService } from './otp.service.js';
import { EmailService } from './email.service.js';

@Module({
  imports: [
    UsersModule,
    ServantsModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRES_SECONDS', 86400)),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokensService,
    RedisService,
    OtpService,
    EmailService,
  ],
  exports: [AuthService, RefreshTokensService, JwtModule],
})
export class AuthModule {}