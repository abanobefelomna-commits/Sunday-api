import { Transform } from 'class-transformer';
import { IsNotEmpty, Validate } from 'class-validator';
import { IsEmailOrEgyptianPhone } from './is-email-or-egyptian-phone.validator.js';

export class EmailDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty({ message: 'الإيميل أو رقم التليفون مطلوب' })
  @Validate(IsEmailOrEgyptianPhone, {
    message: 'أدخل إيميل صحيح أو رقم موبايل مصري صحيح (11 رقم)',
  })
  email: string;
}
