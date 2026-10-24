import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../child.entity.js';

export class FilterChildDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsUUID('4')
  @IsOptional()
  classId?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minAge?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxAge?: number;

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
