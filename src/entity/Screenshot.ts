import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';

@Entity()
export class ProblemLocation {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    description: string;
    @ManyToOne(type => Vulnerability, vulnerability => vulnerability.id)
    vulnerability: Vulnerability;

}