import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';

import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { EmailDto } from './dto/email.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokensService } from './refresh-tokens.service.js';
import { OtpService } from './otp.service.js';
import { OtpPurpose } from './otp-purpose.enum.js';
import { EmailService } from './email.service.js';
import { ServantsService } from '../servants/servants.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokens: RefreshTokensService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly servantsService: ServantsService,
  ) {}

  private async sendOtp(user: User, purpose: OtpPurpose): Promise<void> {
    const { code } = await this.otpService.createCode(user.id, purpose);

    try {
      await this.emailService.sendOtpEmail(user.email, code);
    } catch (error) {
      await this.otpService.invalidateCode(user.id, purpose);
      throw error;
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmailOrPhone(
      dto.email,
      dto.phone,
    );

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'الإيميل مستخدم بالفعل'
          : 'رقم التليفون مستخدم بالفعل',
      );
    }

    const password = await argon2.hash(dto.password);

    try {
      const user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        grades: dto.grades,
        password,
        emailVerified: true,
      });

      // إدراج الخادم تلقائياً في قائمة الخدام وربطه بالفصل المختار
      try {
        await this.servantsService.syncFromUser({
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          grades: user.grades,
        });
      } catch (err) {
        this.logger.warn(`Could not sync servant for user ${user.id}: ${err}`);
      }

      // تسجيل الدخول الفوري بعد التسجيل
      return this.startSession(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23505'
      ) {
        throw new ConflictException('الإيميل أو رقم التليفون مستخدم بالفعل');
      }

      throw error;
    }
  }

  private async verifyStoredPassword(
    user: User,
    candidate: string,
  ): Promise<boolean> {
    if (user.password.startsWith('$argon2')) {
      try {
        return await argon2.verify(user.password, candidate);
      } catch {
        return false;
      }
    }

    // توافق مع كلمات المرور القديمة المشفّرة باستخدام bcryptjs.
    let valid = false;

    try {
      valid = await bcrypt.compare(candidate, user.password);
    } catch {
      return false;
    }

    if (valid) {
      const upgradedHash = await argon2.hash(candidate);
      await this.usersService.updatePassword(user.id, upgradedHash);
      user.password = upgradedHash;
    }

    return valid;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user || !(await this.verifyStoredPassword(user, dto.password))) {
      throw new UnauthorizedException('الإيميل أو الباسورد غلط');
    }

    return this.startSession(user);
  }

  async forgotPassword(dto: EmailDto) {
    try {
      const user = await this.usersService.findByEmailOrPhoneIdentifier(
        dto.email,
      );

      if (user) {
        await this.sendOtp(user, OtpPurpose.PASSWORD_RESET);
      }
    } catch {
      this.logger.warn('Could not process password recovery request');
    }

    return {
      message:
        'إذا كان الحساب مسجلًا، فسيصلك كود استعادة كلمة المرور على بريده الإلكتروني.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmailOrPhoneIdentifier(
      dto.email,
    );

    if (!user) {
      throw new BadRequestException('الكود غير صحيح أو انتهت صلاحيته');
    }

    await this.otpService.verifyCode(
      user.id,
      OtpPurpose.PASSWORD_RESET,
      dto.code,
    );

    const password = await argon2.hash(dto.newPassword);

    await this.usersService.updatePassword(user.id, password);
    await this.refreshTokens.revokeAllForUser(user.id);

    return {
      message: 'تم تغيير كلمة المرور بنجاح. سجّل الدخول مرة أخرى.',
    };
  }

  async logout(token?: string) {
    if (token) {
      await this.refreshTokens.revoke(token);
    }
  }

  async refreshSession(refreshTokenStr: string) {
    const validToken = await this.refreshTokens.findValidToken(refreshTokenStr);
    if (!validToken) {
      throw new UnauthorizedException('جلسة الدخول منتهية أو غير صالحة');
    }

    const user = await this.usersService.findById(validToken.userId);
    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    // إبطال التوكن القديم لمنع إعادة استخدامه
    await this.refreshTokens.revoke(refreshTokenStr);

    return this.startSession(user);
  }

  private async startSession(user: User) {
    const refreshToken = await this.refreshTokens.issue(user.id);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    const { password: _password, ...safeUser } = user;

    return { accessToken, user: safeUser, refreshToken };
  }
}
