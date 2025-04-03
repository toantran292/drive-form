import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Form } from './form.entity';

@Entity('phases')
export class Phase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phaseCode: string;

  @Column()
  name: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.phases, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @OneToMany(() => Form, (form) => form.phase, {
    cascade: true,
  })
  forms: Form[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
