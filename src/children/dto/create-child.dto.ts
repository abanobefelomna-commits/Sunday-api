import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Gender } from '../child.entity.js';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الطفل مطلوب' })
  name: string;

  @IsDateString({}, { message: 'تاريخ الميلاد غير صالح' })
  @IsNotEmpty({ message: 'تاريخ الميلاد مطلوب' })
  birthDate: string;

  @IsEnum(Gender, { message: 'النوع غير صالح (male أو female)' })
  @IsNotEmpty({ message: 'النوع مطلوب' })
  gender: Gender;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsString()
  @IsOptional()
  parentName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID('4', { message: 'معرف الفصل غير صالح' })
  @IsOptional()
  classId?: string;
}
