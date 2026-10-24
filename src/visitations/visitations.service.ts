import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitation } from './visitation.entity.js';
import { CreateVisitationDto } from './dto/create-visitation.dto.js';
import { UpdateVisitationDto } from './dto/update-visitation.dto.js';
import { FilterVisitationDto } from './dto/filter-visitation.dto.js';

@Injectable()
export class VisitationsService {
  constructor(
    @InjectRepository(Visitation)
    private readonly repo: Repository<Visitation>,
  ) {}

  async create(dto: CreateVisitationDto) {
    const visitation = this.repo.create(dto);
    return this.repo.save(visitation);
  }

  async findAll(filter: FilterVisitationDto) {
    const qb = this.repo
      .createQueryBuilder('vis')
      .leftJoinAndSelect('vis.child', 'child')
      .leftJoinAndSelect('vis.servant', 'servant');

    if (filter.childId) {
      qb.andWhere('vis.childId = :childId', { childId: filter.childId });
    }

    if (filter.servantId) {
      qb.andWhere('vis.servantId = :servantId', { servantId: filter.servantId });
    }

    if (filter.type) {
      qb.andWhere('vis.type = :type', { type: filter.type });
    }

    if (filter.status) {
      qb.andWhere('vis.status = :status', { status: filter.status });
    }

    if (filter.dateFrom) {
      qb.andWhere('vis.date >= :dateFrom', { dateFrom: filter.dateFrom });
    }

    if (filter.dateTo) {
      qb.andWhere('vis.date <= :dateTo', { dateTo: filter.dateTo });
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('vis.date', 'DESC').addOrderBy('vis.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const visitation = await this.repo.findOne({
      where: { id },
      relations: { child: true, servant: true },
    });

    if (!visitation) {
      throw new NotFoundException('سجل الافتقاد غير موجود');
    }

    return visitation;
  }

  async update(id: string, dto: UpdateVisitationDto) {
    const visitation = await this.findOne(id);
    Object.assign(visitation, dto);
    return this.repo.save(visitation);
  }

  async remove(id: string) {
    const visitation = await this.findOne(id);
    await this.repo.remove(visitation);
    return { message: 'تم حذف سجل الافتقاد بنجاح' };
  }

  /**
   * جلب تاريخ الافتقادات لطفل معين
   */
  async findByChild(childId: string) {
    return this.repo.find({
      where: { childId },
      relations: { servant: true },
      order: { date: 'DESC' },
    });
  }
}
