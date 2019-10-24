import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fieldName: string;
  @Column()
  originalName: string;
  @Column()
  encoding: string;
  @Column()
  mimetype: string;
  @Column()
  buffer: Buffer;
  @Column()
  size: number;
  @ManyToOne((type) => Vulnerability, (vuln) => vuln.screenshots)
  vulnerability: Vulnerability;
}
