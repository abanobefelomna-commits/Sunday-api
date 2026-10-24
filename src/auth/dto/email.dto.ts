import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class EmailDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'الإيميل غير صحيح' })
  email: string;
}