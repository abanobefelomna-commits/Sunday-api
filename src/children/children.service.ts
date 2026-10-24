import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './child.entity.js';
import { CreateChildDto } from './dto/create-child.dto.js';
import { UpdateChildDto } from './dto/update-child.dto.js';
import { FilterChildDto } from './dto/filter-child.dto.js';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child)
    private readonly repo: Repository<Child>,
  ) {}

  create(dto: CreateChildDto) {
    const child = this.repo.create(dto);
    return this.repo.save(child);
  }

  async findAll(filter: FilterChildDto) {
    const qb = this.repo
      .createQueryBuilder('child')
      .leftJoinAndSelect('child.class', 'class');

    if (filter.name) {
      qb.andWhere('child.name ILIKE :name', { name: `%${filter.name}%` });
    }

    if (filter.gender) {
      qb.andWhere('child.gender = :gender', { gender: filter.gender });
    }

    if (filter.classId) {
      qb.andWhere('child.classId = :classId', { classId: filter.classId });
    }

    // فلترة بالسن - بنحسب السن من تاريخ الميلاد
    if (filter.minAge !== undefined) {
      qb.andWhere(
        `EXTRACT(YEAR FROM AGE(CURRENT_DATE, child."birthDate")) >= :minAge`,
        { minAge: filter.minAge },
      );
    }

    if (filter.maxAge !== undefined) {
      qb.andWhere(
        `EXTRACT(YEAR FROM AGE(CURRENT_DATE, child."birthDate")) <= :maxAge`,
        { maxAge: filter.maxAge },
      );
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('child.createdAt', 'DESC');

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
    const child = await this.repo.findOne({
      where: { id },
      relations: { class: true },
    });
    if (!child) throw new NotFoundException('الطفل غير موجود');
    return child;
  }

  async update(id: string, dto: UpdateChildDto) {
    const child = await this.findOne(id);
    Object.assign(child, dto);
    return this.repo.save(child);
  }

  async remove(id: string) {
    const child = await this.findOne(id);
    await this.repo.remove(child);
    return { message: 'تم حذف الطفل بنجاح' };
  }
}
