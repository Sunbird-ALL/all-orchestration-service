import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Point {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userId!: string

    @Column()
    sessionId!: string

    @Column()
    language!: string

    @Column()
    points!: string

    @Column()
    milestone!: string

    @CreateDateColumn()
    createdAt!: Date;
}