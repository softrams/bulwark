import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Organization } from './Organization';
import { Length } from 'class-validator';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Length(1, 20)
  name: string;
  @ManyToOne((type) => Organization, (organization) => organization.id)
  organization: Organization;
}
