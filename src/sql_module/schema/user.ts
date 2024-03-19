import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class virtualId {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userName!: string

    @Column()
    virtualId!: number

    @CreateDateColumn()
    createdAt!: Date;
}