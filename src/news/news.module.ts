import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './news.entity.js';
import { User } from '../users/user.entity.js';
import { NewsService } from './news.service.js';
import { NewsController } from './news.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([News, User])],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
