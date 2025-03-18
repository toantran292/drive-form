import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Form } from './form.entity';

@Entity('submittions')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column('jsonb', { name: 'meta_data', nullable: true })
    metaData: Record<string, any>;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column({ name: 'form_id' })
    formId: string;

    @ManyToOne(() => User, user => user.submissions, { onDelete: 'SET NULL' })
    user: User;

    @ManyToOne(() => Form, form => form.submissions, { onDelete: 'CASCADE' })
    form: Form;
}