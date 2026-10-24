import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail({}, { message: 'الإيميل غير صحيح' })
    email: string;

    @IsNotEmpty({ message: 'الباسورد مطلوب' })
    password: string;
}