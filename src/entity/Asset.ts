import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './Organization';
import { Assessment } from './Assessment';
import { Length } from 'class-validator';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Length(1, 20)
  name: string;
  @ManyToOne((type) => Organization, (organization) => organization.asset)
  organization: Organization;
  @OneToMany((type) => Assessment, (assessment) => assessment.asset)
  assessment: Assessment[];
}
