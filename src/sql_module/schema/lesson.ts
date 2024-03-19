import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Lesson {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userId!: string

    @Column()
    sessionId!: string

    @Column()
    milestone!: string

    @Column()
    milestoneLevel!: string

    @Column()
    language!: string

    @Column()
    lesson!: string

    @Column()
    progress!: number

    @CreateDateColumn()
    createdAt!: Date;
}