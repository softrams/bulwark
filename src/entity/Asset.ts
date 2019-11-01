import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './Organization';
import { Assessment } from './Assessment';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @ManyToOne((type) => Organization, (organization) => organization.asset)
  organization: Organization;
  @OneToMany((type) => Assessment, (assessment) => assessment.asset)
  assessment: Assessment[];
}
