import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ServantsModule } from './servants/servants.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { ChildrenModule } from './children/children.module.js';
import { UploadModule } from './upload/upload.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { VisitationsModule } from './visitations/visitations.module.js';
import { NewsModule } from './news/news.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // 100 طلب في الدقيقة لكل IP
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: { rejectUnauthorized: false },
              }
            : {
                host: config.get('DB_HOST', 'localhost'),
                port: Number(config.get('DB_PORT', 5432)),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASS') ?? config.get<string>('DB_PASSWORD', ''),
                database: config.get<string>('DB_NAME'),
              }),
          autoLoadEntities: true,
          synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true' || (!databaseUrl && config.get('NODE_ENV') !== 'production'),
        };
      },
    }),
    UsersModule,
    AuthModule,
    ServantsModule,
    ClassesModule,
    ChildrenModule,
    UploadModule,
    AttendanceModule,
    VisitationsModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}