import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VisitationStatus, VisitationType } from '../visitation.entity.js';

export class CreateVisitationDto {
  @ApiProperty({ description: 'معرف الطفل' })
  @IsUUID('4', { message: 'معرف الطفل غير صالح' })
  @IsNotEmpty({ message: 'معرف الطفل مطلوب' })
  childId: string;

  @ApiPropertyOptional({ description: 'معرف الخادم القائم بالافتقاد' })
  @IsOptional()
  @IsUUID('4', { message: 'معرف الخادم غير صالح' })
  servantId?: string;

  @ApiProperty({ description: 'تاريخ الافتقاد (YYYY-MM-DD)', example: '2026-10-24' })
  @IsDateString({}, { message: 'تاريخ الافتقاد يجب أن يكون بصيغة YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({
    enum: VisitationType,
    default: VisitationType.HOME_VISIT,
    description: 'نوع الافتقاد',
  })
  @IsOptional()
  @IsEnum(VisitationType, { message: 'نوع الافتقاد غير صالح' })
  type?: VisitationType;

  @ApiPropertyOptional({
    enum: VisitationStatus,
    default: VisitationStatus.COMPLETED,
    description: 'حالة الافتقاد',
  })
  @IsOptional()
  @IsEnum(VisitationStatus, { message: 'حالة الافتقاد غير صالحة' })
  status?: VisitationStatus;

  @ApiPropertyOptional({ description: 'ملاحظات وتفاصيل الافتقاد' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'تاريخ المتابعة القادمة إن وجد (YYYY-MM-DD)',
    example: '2026-11-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ المتابعة القادمة يجب أن يكون بصيغة YYYY-MM-DD' })
  followUpDate?: string;
}
