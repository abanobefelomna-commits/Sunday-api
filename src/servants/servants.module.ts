import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servant } from './servant.entity.js';
import { ServantsService } from './servants.service.js';
import { ServantsController } from './servants.controller.js';
import { Class } from '../classes/class.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Servant, Class])],
  controllers: [ServantsController],
  providers: [ServantsService],
  exports: [ServantsService],
})
export class ServantsModule {}
