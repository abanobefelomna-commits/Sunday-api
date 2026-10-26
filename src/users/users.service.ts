import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';

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

  async updatePassword(userId: string, password: string) {
    await this.repo.update({ id: userId }, { password });
  }

  findById(userId: string) {
    return this.repo.findOne({ where: { id: userId } });
  }

  async updateAvatar(userId: string, avatar: string | null) {
    await this.repo.update({ id: userId }, { avatar });
  }
}
