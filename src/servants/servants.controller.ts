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
import { ServantsService } from './servants.service.js';
import { CreateServantDto } from './dto/create-servant.dto.js';
import { UpdateServantDto } from './dto/update-servant.dto.js';
import { FilterServantDto } from './dto/filter-servant.dto.js';
import { UploadService } from '../upload/upload.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/role.enum.js';

@ApiTags('Servants - الخدام')
@ApiBearerAuth()
@Controller('servants')
export class ServantsController {
  constructor(
    private readonly servantsService: ServantsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'إضافة خادم جديد (للمسؤولين والكهنة)' })
  create(@Body() dto: CreateServantDto) {
    return this.servantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'استعلام عن قائمة الخدام مع الفلترة والصفحات' })
  findAll(@Query() filter: FilterServantDto) {
    return this.servantsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل خادم بالمعرف' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servantsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'تعديل بيانات خادم (للمسؤولين والكهنة)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServantDto,
  ) {
    return this.servantsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRIEST)
  @ApiOperation({ summary: 'حذف خادم (للمسؤولين والكهنة)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servantsService.remove(id);
  }

  @Patch(':id/avatar')
  @ApiOperation({ summary: 'رفع صورة شخصية (Avatar) للخادم' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: UploadService.multerOptions('avatars').dest,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
          cb(null, uniqueName);
        },
      }),
      limits: UploadService.multerOptions('avatars').limits,
      fileFilter: UploadService.multerOptions('avatars').fileFilter,
    }),
  )
  async uploadAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const servant = await this.servantsService.findOne(id);

    const info = this.uploadService.validateAndGetInfo(file, 'avatars');

    // حذف الصورة القديمة
    this.uploadService.deleteFile(servant.avatar);

    return this.servantsService.updateAvatar(id, info.url);
  }

  @Delete(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف الصورة الشخصية للخادم' })
  async removeAvatar(@Param('id', ParseUUIDPipe) id: string) {
    const servant = await this.servantsService.findOne(id);

    this.uploadService.deleteFile(servant.avatar);

    return this.servantsService.updateAvatar(id, null);
  }
}
