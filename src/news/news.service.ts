import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity.js';
import { User } from '../users/user.entity.js';
import { CreateNewsDto } from './dto/create-news.dto.js';
import { UpdateNewsDto } from './dto/update-news.dto.js';
import { FilterNewsDto } from './dto/filter-news.dto.js';
import { UploadService } from '../upload/upload.service.js';
import { Role } from '../users/role.enum.js';
import type { JwtPayload } from '../auth/decorators/current-user.decorator.js';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * إنشاء خبر أو إعلان جديد
   * متاح لأي رول مسجل في النظام (خدام، كهنة، مشرفين)
   */
  async create(
    dto: CreateNewsDto,
    authorUser?: JwtPayload,
    file?: Express.Multer.File,
  ): Promise<News> {
    const news = this.newsRepo.create({
      content: dto.content,
      title: dto.title ?? null,
      isPinned: dto.isPinned ?? false,
    });

    if (file) {
      const info = this.uploadService.validateAndGetInfo(file, 'news');
      news.image = info.url;
    } else if (dto.image) {
      news.image = dto.image;
    }

    if (authorUser?.sub) {
      const user = await this.userRepo.findOne({
        where: { id: authorUser.sub },
      });
      if (user) {
        news.author = user;
        news.authorName = user.name;
        news.authorRole = user.role;
      }
    }

    return this.newsRepo.save(news);
  }

  /**
   * استرجاع قائمة الأخبار مع الفلترة والصفحات
   * عام ومتاح للجميع في الصفحة الرئيسية
   */
  async findAll(filter: FilterNewsDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepo
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.author', 'author')
      .orderBy('news.isPinned', 'DESC')
      .addOrderBy('news.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filter.search && filter.search.trim()) {
      const term = `%${filter.search.trim()}%`;
      queryBuilder.andWhere(
        '(news.content ILIKE :term OR news.title ILIKE :term)',
        { term },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * تفاصيل خبر محدد بالمعرف
   */
  async findOne(id: string): Promise<News> {
    const news = await this.newsRepo.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!news) {
      throw new NotFoundException('الخبر غير موجود');
    }

    return news;
  }

  /**
   * تحديث بيانات الخبر (الناشر الأصلي أو المشرفين والكهنة)
   */
  async update(
    id: string,
    dto: UpdateNewsDto,
    user?: JwtPayload,
  ): Promise<News> {
    const news = await this.findOne(id);

    this.checkPermission(news, user);

    if (dto.content !== undefined) news.content = dto.content;
    if (dto.title !== undefined) news.title = dto.title ?? null;
    if (dto.isPinned !== undefined) news.isPinned = dto.isPinned;
    if (dto.image !== undefined) news.image = dto.image ?? null;

    return this.newsRepo.save(news);
  }

  /**
   * رفع أو استبدال صورة الخبر
   */
  async updateImage(
    id: string,
    file: Express.Multer.File,
    user?: JwtPayload,
  ): Promise<News> {
    const news = await this.findOne(id);

    this.checkPermission(news, user);

    const info = this.uploadService.validateAndGetInfo(file, 'news');

    // حذف الصورة القديمة من الديسك إن وجدت
    if (news.image) {
      this.uploadService.deleteFile(news.image);
    }

    news.image = info.url;
    return this.newsRepo.save(news);
  }

  /**
   * حذف صورة الخبر فقط
   */
  async removeImage(id: string, user?: JwtPayload): Promise<News> {
    const news = await this.findOne(id);

    this.checkPermission(news, user);

    if (news.image) {
      this.uploadService.deleteFile(news.image);
    }

    news.image = null;
    return this.newsRepo.save(news);
  }

  /**
   * حذف الخبر بالكامل والصورة التابعة له
   */
  async remove(id: string, user?: JwtPayload): Promise<{ success: boolean; message: string }> {
    const news = await this.findOne(id);

    this.checkPermission(news, user);

    if (news.image) {
      this.uploadService.deleteFile(news.image);
    }

    await this.newsRepo.remove(news);
    return { success: true, message: 'تم حذف الخبر بنجاح' };
  }

  /**
   * التحقق من صلاحيات التعديل أو الحذف
   */
  private checkPermission(news: News, user?: JwtPayload): void {
    if (!user) return; // لو تم استدعاء الخدمة داخلياً

    const isPrivileged =
      user.role === Role.ADMIN || user.role === Role.PRIEST;
    const isAuthor = news.author?.id === user.sub;

    if (!isPrivileged && !isAuthor) {
      throw new ForbiddenException('غير مسموح لك بتعديل أو حذف هذا الخبر');
    }
  }
}
