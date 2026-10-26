import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123' })
  @IsString({ message: 'كلمة السر القديمة غير صحيحة' })
  @IsNotEmpty({ message: 'يرجى كتابة كلمة السر الحالية' })
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString({ message: 'كلمة السر الجديدة غير صحيحة' })
  @MinLength(8, { message: 'كلمة السر الجديدة ٨ أحرف على الأقل' })
  newPassword: string;
}
