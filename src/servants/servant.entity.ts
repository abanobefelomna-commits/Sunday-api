import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Class } from '../classes/class.entity.js';

@Entity('servants')
export class Servant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ['خادم', 'خادم رئيسي', 'مشرف'], default: 'خادم' })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @ManyToMany(() => Class, (cls) => cls.servants, { eager: true })
  @JoinTable({ name: 'servants_classes' })
  classes: Relation<Class[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
