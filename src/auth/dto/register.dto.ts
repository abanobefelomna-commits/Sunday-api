import { Transform, TransformFnParams } from 'class-transformer';
import {
    ArrayUnique, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional,
    Matches, MaxLength, MinLength,
} from 'class-validator';
import { Role } from '../../users/role.enum.js';
import { Grade } from '../../users/role.enum.js';

const trim = ({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
    @Transform(trim)
    @IsNotEmpty({ message: 'الاسم مطلوب' })
    @MaxLength(100)
    name: string;

    @Transform(normalizeEmail)
    @IsEmail({}, { message: 'الإيميل غير صحيح' })
    email: string;

    @Transform(trim)
    @Matches(/^01[0125][0-9]{8}$/, { message: 'رقم الموبايل لازم يكون مصري صحيح (11 رقم)' })
    phone: string;

    @MinLength(8, { message: 'الباسورد لازم يكون 8 حروف على الأقل' })
    @MaxLength(128)
    password: string;

    @IsEnum(Role, { message: 'الدور لازم يكون admin أو servant أو priest' })
    role: Role;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(Grade, { each: true, message: 'الفصل لازم يكون واحد من: first, second, third, fourth, fifth, sixth' })
    grades?: Grade[];
}