import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vulnerability } from './Vulnerability';
import { DbAwareColumn } from '../utilities/column-mapper.utility';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fieldName: string;
  @Column()
  originalname: string;
  @Column()
  encoding: string;
  @Column()
  mimetype: string;
  @DbAwareColumn({ name: 'buffer', type: 'mediumblob' })
  buffer: Buffer;
  @Column()
  size: number;
  @ManyToOne((type) => Vulnerability, (vuln) => vuln.screenshots, { onDelete: 'CASCADE' })
  vulnerability: Vulnerability;
}
