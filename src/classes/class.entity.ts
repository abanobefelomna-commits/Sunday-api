import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Servant } from '../servants/servant.entity.js';
import { Child } from '../children/child.entity.js';
import { Grade } from '../users/role.enum.js';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'enum', enum: Grade, nullable: false })
  grade: Grade;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @ManyToMany(() => Servant, (servant) => servant.classes)
  servants: Relation<Servant[]>;

  @OneToMany(() => Child, (child) => child.class)
  children: Relation<Child[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
