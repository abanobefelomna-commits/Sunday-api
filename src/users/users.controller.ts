import {
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
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
import * as argon2 from 'argon2';
import { UsersService } from './users.service.js';
import { UploadService } from '../upload/upload.service.js';
import { ServantsService } from '../servants/servants.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@ApiTags('Users - المستخدمين')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
    private readonly servantsService: ServantsService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على ملف مستخدم بالمعرف' })
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل بيانات المستخدم' })
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const updated = await this.usersService.updateProfile(id, dto);
    if (!updated) throw new NotFoundException('تعذر تحديث البيانات');

    // مزامنة البيانات والفصول مع جدول الخدام
    try {
      await this.servantsService.syncFromUser({
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        grades: updated.grades,
      });
    } catch {
      // ignore
    }

    const { password: _password, ...safeUser } = updated;
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

    // مزامنة الصورة مع جدول الخدام
    try {
      await this.servantsService.syncAvatarByPhone(user.phone, info.url);
    } catch {
      // ignore
    }

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

    // مزامنة حذف الصورة مع جدول الخدام
    try {
      await this.servantsService.syncAvatarByPhone(user.phone, null);
    } catch {
      // ignore
    }

    return { message: 'تم حذف الصورة بنجاح' };
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغيير كلمة المرور لحساب المستخدم' })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findByIdWithPassword(id);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    let isValid = false;
    try {
      isValid = await argon2.verify(user.password, dto.oldPassword);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
    }

    const hashedPassword = await argon2.hash(dto.newPassword);
    await this.usersService.updatePassword(id, hashedPassword);

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}
