import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'الإيميل غير صحيح' })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'كود التحقق يجب أن يتكون من 6 أرقام',
  })
  code: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @MaxLength(128, { message: 'كلمة المرور طويلة جدًا' })
  newPassword: string;
}