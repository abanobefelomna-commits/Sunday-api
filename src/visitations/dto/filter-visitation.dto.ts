import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VisitationStatus, VisitationType } from '../visitation.entity.js';

export class FilterVisitationDto {
  @ApiPropertyOptional({ description: 'فلترة حسب معرف الطفل' })
  @IsOptional()
  @IsUUID('4')
  childId?: string;

  @ApiPropertyOptional({ description: 'فلترة حسب معرف الخادم' })
  @IsOptional()
  @IsUUID('4')
  servantId?: string;

  @ApiPropertyOptional({ enum: VisitationType, description: 'فلترة حسب نوع الافتقاد' })
  @IsOptional()
  @IsEnum(VisitationType)
  type?: VisitationType;

  @ApiPropertyOptional({ enum: VisitationStatus, description: 'فلترة حسب حالة الافتقاد' })
  @IsOptional()
  @IsEnum(VisitationStatus)
  status?: VisitationStatus;

  @ApiPropertyOptional({ description: 'تاريخ البداية (YYYY-MM-DD)', example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'تاريخ النهاية (YYYY-MM-DD)', example: '2026-10-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
