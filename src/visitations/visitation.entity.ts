import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Child } from '../children/child.entity.js';
import { Servant } from '../servants/servant.entity.js';

export enum VisitationType {
  HOME_VISIT = 'home_visit',       // افتقاد منزلي
  PHONE_CALL = 'phone_call',       // مكالمة هاتفية
  CHURCH_MEETING = 'church_meeting', // مقابلة في الكنيسة
  OTHER = 'other',                 // أخرى
}

export enum VisitationStatus {
  PLANNED = 'planned',     // مخطط لها
  COMPLETED = 'completed', // تمت
  CANCELLED = 'cancelled', // أُلغيت
}

@Entity('visitations')
export class Visitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Child, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childId' })
  child: Relation<Child>;

  @Column('uuid')
  childId: string;

  @ManyToOne(() => Servant, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'servantId' })
  servant: Relation<Servant> | null;

  @Column({ type: 'uuid', nullable: true })
  servantId: string | null;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({
    type: 'enum',
    enum: VisitationType,
    default: VisitationType.HOME_VISIT,
  })
  type: VisitationType;

  @Column({
    type: 'enum',
    enum: VisitationStatus,
    default: VisitationStatus.COMPLETED,
  })
  status: VisitationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'date', nullable: true })
  followUpDate: string | null; // تاريخ المتابعة القادمة

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
