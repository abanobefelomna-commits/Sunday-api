import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'توكن التحديث (اختياري لو مبعوت في الـ Cookie)',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
