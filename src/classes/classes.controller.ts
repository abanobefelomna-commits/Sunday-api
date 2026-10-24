import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ClassesService } from './classes.service.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { FilterClassDto } from './dto/filter-class.dto.js';
import { UploadService } from '../upload/upload.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/role.enum.js';

@ApiTags('Classes - الفصول')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'إنشاء فصل جديد (للمسؤولين والكهنة)' })
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'استعلام عن قائمة الفصول' })
  findAll(@Query() filter: FilterClassDto) {
    return this.classesService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل فصل بالمعرف' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'تعديل بيانات فصل (للمسؤولين والكهنة)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'حذف فصل (للمسؤولين والكهنة)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.remove(id);
  }

  @Patch(':id/image')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'رفع صورة غلاف للفصل' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: UploadService.multerOptions('classes').dest,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
          cb(null, uniqueName);
        },
      }),
      limits: UploadService.multerOptions('classes').limits,
      fileFilter: UploadService.multerOptions('classes').fileFilter,
    }),
  )
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const cls = await this.classesService.findOne(id);

    const info = this.uploadService.validateAndGetInfo(file, 'classes');

    // حذف الصورة القديمة
    this.uploadService.deleteFile(cls.image);

    return this.classesService.updateImage(id, info.url);
  }

  @Delete(':id/image')
  @Roles(Role.ADMIN, Role.PRIEST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف صورة غلاف الفصل' })
  async removeImage(@Param('id', ParseUUIDPipe) id: string) {
    const cls = await this.classesService.findOne(id);

    this.uploadService.deleteFile(cls.image);

    return this.classesService.updateImage(id, null);
  }
}
