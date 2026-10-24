import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role, Grade } from './role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: 'boolean', default: true })
  emailVerified: boolean;

  @Column({ unique: true, nullable: false })
  phone: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.SERVANT })
  role: Role;

  @Column({ type: 'enum', enum: Grade, array: true, default: () => "'{}'" })
  grades: Grade[];

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}