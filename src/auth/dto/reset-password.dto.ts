import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsEmailOrEgyptianPhone } from './is-email-or-egyptian-phone.validator.js';

export class ResetPasswordDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty({ message: 'الإيميل أو رقم التليفون مطلوب' })
  @Validate(IsEmailOrEgyptianPhone, {
    message: 'أدخل إيميل صحيح أو رقم موبايل مصري صحيح (11 رقم)',
  })
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
