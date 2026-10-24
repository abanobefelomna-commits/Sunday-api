import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitation } from './visitation.entity.js';
import { VisitationsService } from './visitations.service.js';
import { VisitationsController } from './visitations.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Visitation])],
  controllers: [VisitationsController],
  providers: [VisitationsService],
  exports: [VisitationsService],
})
export class VisitationsModule {}
