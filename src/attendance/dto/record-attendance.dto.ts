import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../attendance.entity.js';

export class AttendanceRecordItem {
  @IsUUID('4', { message: 'معرّف الطفل يجب أن يكون UUID صالح' })
  childId: string;

  @IsEnum(AttendanceStatus, {
    message: 'الحالة لازم تكون present أو absent أو late أو excused',
  })
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordAttendanceDto {
  @IsUUID('4', { message: 'معرّف الفصل يجب أن يكون UUID صالح' })
  classId: string;

  @IsDateString({}, { message: 'التاريخ لازم يكون بصيغة YYYY-MM-DD' })
  @IsNotEmpty({ message: 'التاريخ مطلوب' })
  date: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'لازم يكون فيه طفل واحد على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItem)
  records: AttendanceRecordItem[];
}
