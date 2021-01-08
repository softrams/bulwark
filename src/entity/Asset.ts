import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
} from 'typeorm';
import { Organization } from './Organization';
import { Assessment } from './Assessment';
import { IsIn } from 'class-validator';
import { Jira } from './Jira';
import { Team } from './Team';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  @IsIn(['A', 'AH'])
  status: string;
  @ManyToOne((type) => Organization, (organization) => organization.asset)
  organization: Organization;
  @OneToMany((type) => Assessment, (assessment) => assessment.asset)
  assessment: Assessment[];
  @OneToOne((type) => Jira, (jira) => jira.asset)
  jira: Jira;
  @ManyToMany(() => Team, (team) => team.assets)
  teams: Team[];
}
