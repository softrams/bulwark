import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Asset } from './Asset';
import { Vulnerability } from './Vulnerability';
import { IsUrl, IsDate, MaxLength, IsString } from 'class-validator';
import { User } from './User';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ length: 4000 })
  executiveSummary: string;
  @Column()
  jiraId: string;
  @Column()
  @IsUrl()
  testUrl: string;
  @Column()
  @IsUrl()
  prodUrl: string;
  @Column()
  scope: string;
  @Column()
  @IsString()
  tag: string;
  @Column()
  @IsDate()
  startDate: Date;
  @Column()
  @IsDate()
  endDate: Date;
  @ManyToOne((type) => Asset, (asset) => asset.assessment, { onDelete: 'CASCADE' })
  asset: Asset;
  @OneToMany((type) => Vulnerability, (vuln) => vuln.assessment)
  vulnerabilities: Vulnerability[];
  @ManyToMany((type) => User)
  @JoinTable()
  testers: User[];
}
