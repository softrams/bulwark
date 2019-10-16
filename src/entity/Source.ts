import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';

@Entity()
export class Source {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    description: string;
    @Column()
    url: string;
    @ManyToOne(type => Vulnerability, vulnerability => vulnerability.id)
    vulnerability: Vulnerability;

}