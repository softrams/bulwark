import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';
import { MaxLength } from 'class-validator';

@Entity()
export class ProblemLocation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @MaxLength(255)
  location: string;
  @Column()
  @MaxLength(255)
  target: string;
  @ManyToOne((type) => Vulnerability, (vuln) => vuln.problemLocations, { onDelete: 'CASCADE' })
  vulnerability: Vulnerability;
}
