import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
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
}