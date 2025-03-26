import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum QuestionType {
  TEXT = 'text',
  PARAGRAPH = 'paragraph',
  MULTIPLE_CHOICE = 'multiple_choice',
  SINGLE_CHOICE = 'single_choice',
  CHECKBOX = 'checkbox',
  DROPDOWN = 'dropdown',
  FILE_UPLOAD = 'file_upload',
  DATE = 'date',
  TIME = 'time',
  LINEAR_SCALE = 'linear_scale',
  MULTIPLE_CHOICE_GRID = 'multiple_choice_grid',
  CHECKBOX_GRID = 'checkbox_grid',
}

export interface FormSettings {
  collectEmail: boolean;
  limitOneResponsePerUser: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  confirmationMessage: string;
  theme: {
    color: string;
    font: string;
    headerImage?: string;
  };
  isPublished: boolean;
  publishedAt?: Date;
  allowAnonymous: boolean;
  acceptingResponses: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedFileTypes?: string[];
  };
  layout?: {
    columns?: number;
    rows?: string[];
  };
  scale?: {
    start: number;
    end: number;
    startLabel?: string;
    endLabel?: string;
  };
}

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb', { nullable: true, default: [] })
  questions: Question[];

  @Column('jsonb', {
    nullable: true,
    default: {
      theme: {
        color: '#1a73e8',
        font: 'Default',
      },
      collectEmail: false,
      limitOneResponsePerUser: false,
      showProgressBar: true,
      shuffleQuestions: false,
      confirmationMessage: 'Your response has been recorded.',
      isPublished: false,
      allowAnonymous: false,
      acceptingResponses: true,
    },
  })
  settings: FormSettings;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  shareId?: string;

  @Column('jsonb', { nullable: true, default: [] })
  sharedWith: { userId: string; permission: 'view' | 'edit' }[];

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => FormResponse, (response) => response.form)
  responses: FormResponse[];

  @Column({ default: 0 })
  responseCount: number;

  @Column('jsonb', { nullable: true })
  analytics: {
    totalResponses: number;
    responsesByDate: { [date: string]: number };
    averageCompletionTime: number;
    completionRate: number;
    questions: {
      [questionId: string]: {
        totalResponses: number;
        options: { [value: string]: number };
        skipped: number;
      };
    };
  };
}

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Form, (form) => form.responses)
  @JoinColumn({ name: 'formId' })
  form: Form;

  @Column()
  formId: string;

  @ManyToOne(() => User, { nullable: true })
  respondent: User;

  @Column({ nullable: true })
  respondentId?: string;

  @Column('jsonb')
  answers: { questionId: string; value: string | string[] }[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;
}
