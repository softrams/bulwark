import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';

@Entity()
export class ProblemLocation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  location: string;
  @Column()
  target: string;
  @ManyToOne((type) => Vulnerability, (vuln) => vuln.problemLocations, { onDelete: 'CASCADE' })
  vulnerability: Vulnerability;
}
