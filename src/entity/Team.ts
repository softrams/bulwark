import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { IsDate, IsIn } from 'class-validator';
import { User } from './User';
import { Organization } from './Organization';
import { Asset } from './Asset';

@Entity()
export class Team {
  @PrimaryGeneratedColumn({})
  id: number;
  @Column()
  name: string;
  @ManyToOne((type) => Organization, (organization) => organization.teams)
  organization: Organization;
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
  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable()
  users: User[];
  @ManyToMany(() => Asset, (asset) => asset.teams)
  @JoinTable()
  assets: Asset[];
}
