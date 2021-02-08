import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
} from 'typeorm';
import { IsDate, IsIn } from 'class-validator';
import { User } from './User';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  key: string;
  @Column()
  active: boolean;
  @Column()
  @IsDate()
  lastUpdatedBy: number;
  @Column()
  @IsDate()
  createdDate: Date;
  @Column()
  @IsDate()
  lastUpdatedDate: Date;
  @ManyToOne((type) => User, (user) => user.apiKey)
  user: User;
}
