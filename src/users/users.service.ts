import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { Grade } from './role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }

  findByEmailOrPhone(email: string, phone: string) {
    return this.repo.findOne({
      where: [{ email }, { phone }],
    });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByEmailOrPhoneIdentifier(identifier: string) {
    return this.repo.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  findByEmailWithPassword(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByIdWithPassword(userId: string) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async updatePassword(userId: string, password: string) {
    await this.repo.update({ id: userId }, { password });
  }

  findById(userId: string) {
    return this.repo.findOne({ where: { id: userId } });
  }

  async updateAvatar(userId: string, avatar: string | null) {
    await this.repo.update({ id: userId }, { avatar });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; grades?: Grade[] },
  ) {
    if (data.phone) {
      const existing = await this.repo.findOne({ where: { phone: data.phone } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('رقم التليفون مستخدم بالفعل بحساب آخر');
      }
    }
    await this.repo.update({ id: userId }, data);
    return this.findById(userId);
  }
}
