import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Class } from '../classes/class.entity.js';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'date', nullable: false })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender: Gender;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Class, (cls) => cls.children, { eager: true, onDelete: 'SET NULL' })
  class: Relation<Class>;

  @Column({ nullable: true })
  classId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
