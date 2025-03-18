import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Submission } from './submission.entity';

@Entity('forms')
export class Form {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column()
    name: string;

    @Column('jsonb', { name: 'meta_data', nullable: true })
    metaData: Record<string, any>;

    @Column({ name: 'pri_key', nullable: true })
    priKey: string;

    @Column({ name: 'pub_key', nullable: true })
    pubKey: string;

    @Column({ name: 'author_id' })
    authorId: string;

    @ManyToOne(() => User, user => user.forms, { onDelete: 'CASCADE' })
    author: User;

    @OneToMany(() => Submission, submission => submission.form)
    submissions: Submission[];
}