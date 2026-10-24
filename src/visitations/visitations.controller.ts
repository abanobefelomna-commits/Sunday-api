import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VisitationsService } from './visitations.service.js';
import { CreateVisitationDto } from './dto/create-visitation.dto.js';
import { UpdateVisitationDto } from './dto/update-visitation.dto.js';
import { FilterVisitationDto } from './dto/filter-visitation.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/role.enum.js';

@ApiTags('Visitations - الافتقاد')
@ApiBearerAuth()
@Controller('visitations')
export class VisitationsController {
  constructor(private readonly visitationsService: VisitationsService) {}

  @Post()
  @ApiOperation({ summary: 'تسجيل افتقاد جديد لطفل' })
  create(@Body() dto: CreateVisitationDto) {
    return this.visitationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'استعلام عن سجلات الافتقاد مع الفلترة والصفحات' })
  findAll(@Query() filter: FilterVisitationDto) {
    return this.visitationsService.findAll(filter);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'سجل افتقادات طفل معين' })
  findByChild(@Param('childId', ParseUUIDPipe) childId: string) {
    return this.visitationsService.findByChild(childId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل سجل افتقاد بالمعرف' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث بيانات سجل افتقاد' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisitationDto,
  ) {
    return this.visitationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'حذف سجل افتقاد (للمسؤولين والكهنة فقط)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitationsService.remove(id);
  }
}
