import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fieldName: string;
  @Column()
  name: string;
  @Column()
  encoding: string;
  @Column()
  mimetype: string;
  @Column()
  buffer: Buffer;
  @Column()
  size: number;
  @ManyToOne((type) => Vulnerability, (vuln) => vuln.screenshots, { onDelete: 'CASCADE' })
  vulnerability: Vulnerability;
}
