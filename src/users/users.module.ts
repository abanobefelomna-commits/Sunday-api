import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { ServantsModule } from '../servants/servants.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ServantsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }