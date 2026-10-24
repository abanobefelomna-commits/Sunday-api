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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { NewsService } from './news.service.js';
import { CreateNewsDto } from './dto/create-news.dto.js';
import { UpdateNewsDto } from './dto/update-news.dto.js';
import { FilterNewsDto } from './dto/filter-news.dto.js';
import { UploadService } from '../upload/upload.service.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { CurrentUser, type JwtPayload } from '../auth/decorators/current-user.decorator.js';

@ApiTags('News - الأخبار والإعلانات')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'إضافة خبر أو إعلان جديد (متاح لجميع الرتب: خدام، كهنة، مشرفين)',
    description: 'يمكن إرسال البيانات كـ JSON أو كـ multipart/form-data مع صورة مرفقة اختيارية',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'نص الخبر' },
        title: { type: 'string', description: 'عنوان الخبر (اختياري)' },
        isPinned: { type: 'boolean', description: 'تثبيت الخبر' },
        image: { type: 'string', format: 'binary', description: 'صورة الخبر (اختياري)' },
      },
      required: ['content'],
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: UploadService.multerOptions('news').dest,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
          cb(null, uniqueName);
        },
      }),
      limits: UploadService.multerOptions('news').limits,
      fileFilter: UploadService.multerOptions('news').fileFilter,
    }),
  )
  create(
    @Body() dto: CreateNewsDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.create(dto, user, file);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'عرض قائمة الأخبار والإعلانات في الصفحة الرئيسية (متاح للجميع)' })
  findAll(@Query() filter: FilterNewsDto) {
    return this.newsService.findAll(filter);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'عرض تفاصيل خبر محدد بالمعرف' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تعديل بيانات الخبر (الناشر الأصلي أو المسؤولين/الكهنة)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsService.update(id, dto, user);
  }

  @Patch(':id/image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'رفع أو تغيير صورة الخبر' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: UploadService.multerOptions('news').dest,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
          cb(null, uniqueName);
        },
      }),
      limits: UploadService.multerOptions('news').limits,
      fileFilter: UploadService.multerOptions('news').fileFilter,
    }),
  )
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsService.updateImage(id, file, user);
  }

  @Delete(':id/image')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف صورة الخبر' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsService.removeImage(id, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف الخبر نهائياً' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.newsService.remove(id, user);
  }
}
