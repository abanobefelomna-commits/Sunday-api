import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Servant } from './servant.entity.js';
import { CreateServantDto } from './dto/create-servant.dto.js';
import { UpdateServantDto } from './dto/update-servant.dto.js';
import { FilterServantDto } from './dto/filter-servant.dto.js';
import { Class } from '../classes/class.entity.js';

@Injectable()
export class ServantsService {
  constructor(
    @InjectRepository(Servant)
    private readonly repo: Repository<Servant>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
  ) {}

  async create(dto: CreateServantDto) {
    const servant = this.repo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      role: dto.role,
    });

    if (dto.classIds?.length) {
      servant.classes = await this.classRepo.findBy({
        id: In(dto.classIds),
      });
    }

    return this.repo.save(servant);
  }

  async findAll(filter: FilterServantDto) {
    const qb = this.repo
      .createQueryBuilder('servant')
      .leftJoinAndSelect('servant.classes', 'class');

    if (filter.name) {
      qb.andWhere('servant.name ILIKE :name', { name: `%${filter.name}%` });
    }

    if (filter.role) {
      qb.andWhere('servant.role = :role', { role: filter.role });
    }

    if (filter.phone) {
      qb.andWhere('servant.phone ILIKE :phone', { phone: `%${filter.phone}%` });
    }

    if (filter.classId) {
      qb.andWhere('class.id = :classId', { classId: filter.classId });
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('servant.createdAt', 'DESC');

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
    const servant = await this.repo.findOne({
      where: { id },
      relations: { classes: true },
    });
    if (!servant) throw new NotFoundException('الخادم غير موجود');
    return servant;
  }

  async update(id: string, dto: UpdateServantDto) {
    const servant = await this.findOne(id);

    if (dto.name !== undefined) servant.name = dto.name;
    if (dto.phone !== undefined) servant.phone = dto.phone;
    if (dto.email !== undefined) servant.email = dto.email!;
    if (dto.role !== undefined) servant.role = dto.role!;

    if (dto.classIds !== undefined) {
      servant.classes = dto.classIds.length
        ? await this.classRepo.findBy({ id: In(dto.classIds) })
        : [];
    }

    return this.repo.save(servant);
  }

  async remove(id: string) {
    const servant = await this.findOne(id);
    await this.repo.remove(servant);
    return { message: 'تم حذف الخادم بنجاح' };
  }

  async updateAvatar(id: string, avatar: string | null) {
    await this.repo.update({ id }, { avatar });
    return { message: avatar ? 'تم رفع الصورة بنجاح' : 'تم حذف الصورة بنجاح', avatar };
  }
}
