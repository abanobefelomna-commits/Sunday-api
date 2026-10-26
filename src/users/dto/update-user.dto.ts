import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Grade } from '../role.enum.js';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'أ. مينا سامي' })
  @IsOptional()
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم حرفين على الأقل' })
  name?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsOptional()
  @Matches(/^01[0125][0-9]{8}$/, { message: 'رقم الموبايل المصري غير صحيح' })
  phone?: string;

  @ApiPropertyOptional({ enum: Grade, isArray: true })
  @IsOptional()
  @IsArray({ message: 'المراحل يجب أن تكون مصفوفة' })
  @IsEnum(Grade, { each: true, message: 'مرحلة غير صحيحة' })
  grades?: Grade[];
}
