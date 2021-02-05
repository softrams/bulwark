import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Asset } from './Asset';
import { IsIn } from 'class-validator';
import { Team } from './Team';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  @IsIn(['A', 'AH'])
  status: string;
  @OneToMany((type) => Asset, (asset) => asset.organization)
  asset: Asset[];
  @OneToMany((type) => Team, (team) => team.organization)
  teams: Team[];
}
