import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service.js';
import { RecordAttendanceDto } from './dto/record-attendance.dto.js';
import { FilterAttendanceDto } from './dto/filter-attendance.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/role.enum.js';

@ApiTags('Attendance - الحضور والغياب')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  @ApiOperation({ summary: 'تسجيل حضور مجمّع لأطفال الفصل في تاريخ معين' })
  recordBulk(
    @Body() dto: RecordAttendanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.recordBulk(dto, user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'استعلام عن سجلات الحضور مع الفلترة والصفحات' })
  findAll(@Query() filter: FilterAttendanceDto) {
    return this.attendanceService.findAll(filter);
  }

  @Get('summary')
  @ApiOperation({ summary: 'ملخص نسب الحضور والغياب لفصل في يوم معين' })
  getSummary(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getSummary(classId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل سجل حضور بالمعرف' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'حذف سجل حضور (للمسؤولين والكهنة فقط)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.remove(id);
  }
}
