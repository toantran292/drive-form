import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Phase } from './phase.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  project_code: string;

  @Column()
  name: string;

  @OneToMany(() => Project, (project) => project.category)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  projectCode: string;

  @Column()
  name: string;

  @ManyToOne(() => User)
  creator: User;

  @ManyToMany(() => User, (user) => user.sharedProjects)
  @JoinTable({
    name: 'project_users', // tên bảng trung gian
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_uid',
      referencedColumnName: 'uid',
    },
  })
  sharedWithUsers: User[];

  @ManyToOne(() => Category, (category) => category.projects, {
    nullable: false,
  })
  category: Category;

  @OneToMany(() => Phase, (phase) => phase.project, {
    cascade: true,
  })
  phases: Phase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
