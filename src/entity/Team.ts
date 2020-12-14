import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { IsDate, IsIn } from 'class-validator';
import { User } from './User';

@Entity()
export class Team {
  @PrimaryGeneratedColumn({})
  id: number;
  @Column()
  name: string;
  @Column()
  @IsDate()
  createdDate: Date;
  @Column({ nullable: true })
  createdBy: number;
  @Column()
  @IsDate()
  lastUpdatedDate: Date;
  @Column({ nullable: true })
  lastUpdatedBy: number;
  @Column()
  @IsIn(['Admin', 'Read-Only', 'Tester'])
  role: string;
  @ManyToMany(() => User)
  @JoinTable()
  users: User[];
}
