import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  author: Relation<User> | null;

  @Column({ type: 'varchar', nullable: true })
  authorName: string | null;

  @Column({ type: 'varchar', nullable: true })
  authorRole: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
