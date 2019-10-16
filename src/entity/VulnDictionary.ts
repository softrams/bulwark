import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VulnDictionary {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    description: string;
    
}