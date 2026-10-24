import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateServantDto {
  @IsString()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'رقم التليفون مطلوب' })
  phone: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsOptional()
  email?: string;

  @IsEnum(['خادم', 'خادم رئيسي', 'مشرف'], { message: 'الدور غير صالح' })
  @IsOptional()
  role?: string;

  @IsUUID('4', { each: true, message: 'معرف الفصل غير صالح' })
  @IsOptional()
  classIds?: string[];
}
