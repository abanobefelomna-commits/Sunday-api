import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FilterNewsDto {
  @ApiPropertyOptional({ description: 'البحث في نص أو عنوان الخبر' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
