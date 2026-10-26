

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmetImport from 'helmet';
import type { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module.js';

// معالجة اختلاف تعريف أنواع Helmet في TypeScript
const helmet = helmetImport as unknown as () => RequestHandler;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // هيدرز أمان (بيشيل X-Powered-By وبيضيف CSP وغيرها)
  app.use(helmet());
  app.use(cookieParser());

  // تمكين استعراض الصور والملفات المرفوعة (Static Assets)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // CORS: بنسمح لعناوين الواجهة بتاعتنا بس، مش لأي موقع
  app.enableCors({
    origin: config
      .get<string>('CORS_ORIGINS', 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // إعداد توثيق Swagger للـ API
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sunday School API — خدمة مدارس الأحد')
    .setDescription(
      'واجهة برمجة التطبيقات لإدارة فصول ومدارس الأحد، الأطفال، الخدام، الحضور والغياب، والافتقاد',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.get('PORT', 3001));
}

void bootstrap();
