import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity("learnerai_virtual_id")
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