import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Form } from './form.entity';

@Entity('users')
export class User {
    @PrimaryColumn()
    uid: string; // Firebase UID

    @Column()
    email: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ nullable: true })
    photoURL: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Form, form => form.owner)
    forms: Form[];
} 