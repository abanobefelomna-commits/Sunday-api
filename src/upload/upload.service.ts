import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';

export interface UploadedFileInfo {
  filename: string;
  path: string;
  url: string;
}

@Injectable()
export class UploadService {
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  constructor() {
    // نتأكد إن فولدرات الرفع موجودة
    for (const sub of ['avatars', 'classes', 'news']) {
      const dir = join(this.uploadRoot, sub);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * التحقق من الملف المرفوع وإرجاع معلوماته
   */
  validateAndGetInfo(
    file: Express.Multer.File,
    subfolder: 'avatars' | 'classes' | 'news',
  ): UploadedFileInfo {
    if (!file) {
      throw new BadRequestException('الملف مطلوب');
    }

    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowed.includes(ext)) {
      throw new BadRequestException(
        'الصور المسموح بيها: JPG, JPEG, PNG, WEBP فقط',
      );
    }

    // 5 MB max
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('حجم الصورة لازم يكون أقل من 5 ميجا');
    }

    return {
      filename: file.filename,
      path: file.path,
      url: `/uploads/${subfolder}/${file.filename}`,
    };
  }

  /**
   * حذف صورة قديمة من الديسك
   */
  deleteFile(relativePath: string | null | undefined): void {
    if (!relativePath) return;

    // relativePath يكون زي /uploads/avatars/xxx.jpg أو /uploads/news/xxx.jpg
    const filename = relativePath.split('/').pop();
    if (!filename) return;

    // نحدد الفولدر الفرعي
    let subfolder: 'avatars' | 'classes' | 'news' = 'classes';
    if (relativePath.includes('/avatars/')) {
      subfolder = 'avatars';
    } else if (relativePath.includes('/news/')) {
      subfolder = 'news';
    }

    const fullPath = join(this.uploadRoot, subfolder, filename);

    try {
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }
    } catch {
      // لو فشل الحذف مش هنعطل الحاجة
    }
  }

  /**
   * Multer disk storage config
   */
  static multerOptions(subfolder: 'avatars' | 'classes' | 'news') {
    const dest = join(process.cwd(), 'uploads', subfolder);

    return {
      dest,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (
        _req: any,
        file: Express.Multer.File,
        cb: (error: Error | null, accept: boolean) => void,
      ) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'الصور المسموح بيها: JPG, JPEG, PNG, WEBP فقط',
            ),
            false,
          );
        }
      },
    };
  }
}
