import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Length } from 'class-validator';
import { File } from './File';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Length(1, 20)
  name: string;
  @OneToOne((type) => File, { onDelete: 'CASCADE' })
  @JoinColumn()
  avatar: number;
}
