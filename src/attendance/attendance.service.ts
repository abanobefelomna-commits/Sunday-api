import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './attendance.entity.js';
import { RecordAttendanceDto } from './dto/record-attendance.dto.js';
import { FilterAttendanceDto } from './dto/filter-attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  /**
   * تسجيل حضور مجمّع لفصل في يوم معين.
   * بيعمل upsert: لو في سجل موجود لنفس الطفل+الفصل+التاريخ بيحدّثه.
   */
  async recordBulk(dto: RecordAttendanceDto, recordedBy?: string) {
    const entities = dto.records.map((r) =>
      this.repo.create({
        childId: r.childId,
        classId: dto.classId,
        date: dto.date,
        status: r.status,
        notes: r.notes,
        recordedBy,
      }),
    );

    // upsert: لو الطفل مسجل في نفس اليوم ونفس الفصل، حدّث الحالة والملاحظات
    await this.repo.upsert(entities, ['childId', 'classId', 'date']);

    return {
      message: `تم تسجيل حضور ${dto.records.length} طفل بنجاح`,
      date: dto.date,
      classId: dto.classId,
    };
  }

  async findAll(filter: FilterAttendanceDto) {
    const qb = this.repo
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.child', 'child')
      .leftJoinAndSelect('att.class', 'class');

    if (filter.classId) {
      qb.andWhere('att.classId = :classId', { classId: filter.classId });
    }

    if (filter.childId) {
      qb.andWhere('att.childId = :childId', { childId: filter.childId });
    }

    if (filter.dateFrom) {
      qb.andWhere('att.date >= :dateFrom', { dateFrom: filter.dateFrom });
    }

    if (filter.dateTo) {
      qb.andWhere('att.date <= :dateTo', { dateTo: filter.dateTo });
    }

    if (filter.status) {
      qb.andWhere('att.status = :status', { status: filter.status });
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('att.date', 'DESC').addOrderBy('child.name', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * ملخص حضور فصل في يوم معين
   */
  async getSummary(classId: string, date: string) {
    const records = await this.repo.find({
      where: { classId, date },
      relations: { child: true },
    });

    const summary = {
      date,
      classId,
      total: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
      records,
    };

    return summary;
  }

  async findOne(id: string) {
    const record = await this.repo.findOne({
      where: { id },
      relations: { child: true, class: true },
    });
    if (!record) throw new NotFoundException('سجل الحضور غير موجود');
    return record;
  }

  async remove(id: string) {
    const record = await this.findOne(id);
    await this.repo.remove(record);
    return { message: 'تم حذف سجل الحضور' };
  }
}
