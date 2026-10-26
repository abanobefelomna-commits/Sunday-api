import { Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { FilterClassDto } from './dto/filter-class.dto.js';
import { Grade } from '../users/role.enum.js';

@Injectable()
export class ClassesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectRepository(Class)
    private readonly repo: Repository<Class>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultClasses();
  }

  async seedDefaultClasses() {
    const DEFAULT_CLASSES = [
      { name: 'فصل سنة أولى ابتدائي', grade: Grade.FIRST, description: 'خدمة وتربية أطفال سنة أولى ابتدائي' },
      { name: 'فصل سنة ثانية ابتدائي', grade: Grade.SECOND, description: 'خدمة وتربية أطفال سنة ثانية ابتدائي' },
      { name: 'فصل سنة ثالثة ابتدائي', grade: Grade.THIRD, description: 'خدمة وتربية أطفال سنة ثالثة ابتدائي' },
      { name: 'فصل سنة رابعة ابتدائي', grade: Grade.FOURTH, description: 'خدمة وتربية أطفال سنة رابعة ابتدائي' },
      { name: 'فصل سنة خامسة ابتدائي', grade: Grade.FIFTH, description: 'خدمة وتربية أطفال سنة خامسة ابتدائي' },
      { name: 'فصل سنة سادسة ابتدائي', grade: Grade.SIXTH, description: 'خدمة وتربية أطفال سنة سادسة ابتدائي' },
    ];

    for (const item of DEFAULT_CLASSES) {
      const exists = await this.repo.findOne({ where: { grade: item.grade } });
      if (!exists) {
        await this.repo.save(this.repo.create(item));
        this.logger.log(`تم إنشاء ${item.name} تلقائياً`);
      }
    }
  }

  create(dto: CreateClassDto) {
    const cls = this.repo.create(dto);
    return this.repo.save(cls);
  }

  async findAll(filter: FilterClassDto) {
    const qb = this.repo
      .createQueryBuilder('class')
      .loadRelationIdAndMap('class.childrenIds', 'class.children')
      .loadRelationIdAndMap('class.servantIds', 'class.servants');

    // نضيف subquery لعدد الأطفال والخدام
    qb.addSelect((sub) =>
      sub
        .select('COUNT(child.id)')
        .from('children', 'child')
        .where('child."classId" = class.id'),
      'childrenCount',
    );

    if (filter.name) {
      qb.andWhere('class.name ILIKE :name', { name: `%${filter.name}%` });
    }

    if (filter.grade) {
      qb.andWhere('class.grade = :grade', { grade: filter.grade });
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('class.createdAt', 'DESC');

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
    const cls = await this.repo.findOne({
      where: { id },
      relations: { servants: true, children: true },
    });
    if (!cls) throw new NotFoundException('الفصل غير موجود');
    return cls;
  }

  async update(id: string, dto: UpdateClassDto) {
    const cls = await this.findOne(id);
    Object.assign(cls, dto);
    return this.repo.save(cls);
  }

  async remove(id: string) {
    const cls = await this.findOne(id);
    await this.repo.remove(cls);
    return { message: 'تم حذف الفصل بنجاح' };
  }

  async updateImage(id: string, image: string | null) {
    await this.repo.update({ id }, { image });
    return { message: image ? 'تم رفع الصورة بنجاح' : 'تم حذف الصورة بنجاح', image };
  }
}
