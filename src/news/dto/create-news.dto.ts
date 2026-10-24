import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ description: 'نص الخبر أو الإعلان' })
  @IsString({ message: 'نص الخبر يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'نص الخبر مطلوب' })
  content: string;

  @ApiPropertyOptional({ description: 'عنوان الخبر (اختياري)' })
  @IsString({ message: 'عنوان الخبر يجب أن يكون نصاً' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'رابط صورة الخبر (اختياري)' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ description: 'تثبيت الخبر في المقدمة', default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isPinned?: boolean;
}
