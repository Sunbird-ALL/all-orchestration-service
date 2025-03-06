import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("learnerai_learner_progress")
export class learner_progress {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userId!: string

    @Column()
    sessionId!: string

    @Column()
    subSessionId!: string

    @Column()
    milestoneLevel!: string

    @Column()
    language!: string

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}