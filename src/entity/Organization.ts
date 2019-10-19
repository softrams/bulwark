import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { File } from './File';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @OneToOne((type) => File)
  @JoinColumn()
  avatar: number;
}
