import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Grade } from '../../users/role.enum.js';

export class FilterClassDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Grade)
  @IsOptional()
  grade?: Grade;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
