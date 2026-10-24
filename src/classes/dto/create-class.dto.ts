import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Grade } from '../../users/role.enum.js';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الفصل مطلوب' })
  name: string;

  @IsEnum(Grade, { message: 'الدرجة غير صالحة' })
  @IsNotEmpty({ message: 'الدرجة مطلوبة' })
  grade: Grade;

  @IsString()
  @IsOptional()
  description?: string;
}
