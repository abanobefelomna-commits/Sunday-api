import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Child } from '../children/child.entity.js';
import { Class } from '../classes/class.entity.js';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

@Entity('attendance')
@Unique(['childId', 'classId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Child, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childId' })
  child: Relation<Child>;

  @Column('uuid')
  childId: string;

  @ManyToOne(() => Class, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Relation<Class>;

  @Column('uuid')
  classId: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ nullable: true })
  notes: string;

  /** UUID الخادم اللي سجّل الحضور */
  @Column({ type: 'uuid', nullable: true })
  recordedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
