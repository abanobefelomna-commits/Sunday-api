import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './child.entity.js';
import { ChildrenService } from './children.service.js';
import { ChildrenController } from './children.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Child])],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
