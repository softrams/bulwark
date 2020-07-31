import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './Organization';
import { Assessment } from './Assessment';
import { IsIn } from 'class-validator';

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
}
