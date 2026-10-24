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
import { ChildrenService } from './children.service.js';
import { CreateChildDto } from './dto/create-child.dto.js';
import { UpdateChildDto } from './dto/update-child.dto.js';
import { FilterChildDto } from './dto/filter-child.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/role.enum.js';

@ApiTags('Children - الأطفال')
@ApiBearerAuth()
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @ApiOperation({ summary: 'إضافة طفل جديد' })
  create(@Body() dto: CreateChildDto) {
    return this.childrenService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'استعلام عن قائمة الأطفال مع الفلترة والصفحات' })
  findAll(@Query() filter: FilterChildDto) {
    return this.childrenService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل طفل بالمعرف' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.childrenService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل بيانات طفل' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChildDto,
  ) {
    return this.childrenService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'حذف طفل (للمسؤولين والكهنة فقط)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.childrenService.remove(id);
  }
}
