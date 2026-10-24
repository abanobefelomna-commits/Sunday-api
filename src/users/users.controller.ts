import {
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { UsersService } from './users.service.js';
import { UploadService } from '../upload/upload.service.js';

@ApiTags('Users - المستخدمين')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على ملف مستخدم بالمعرف' })
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  @Patch(':id/avatar')
  @ApiOperation({ summary: 'رفع صورة شخصية لحساب المستخدم' })
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
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const info = this.uploadService.validateAndGetInfo(file, 'avatars');

    // حذف الصورة القديمة
    this.uploadService.deleteFile(user.avatar);

    await this.usersService.updateAvatar(id, info.url);

    return { message: 'تم رفع الصورة بنجاح', avatar: info.url };
  }

  @Delete(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف الصورة الشخصية للمستخدم' })
  async removeAvatar(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    this.uploadService.deleteFile(user.avatar);
    await this.usersService.updateAvatar(id, null);

    return { message: 'تم حذف الصورة بنجاح' };
  }
}
