import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Asset } from './Asset';
import { Vulnerability } from './Vulnerability';
import { Length, IsUrl, IsDate, MaxLength, IsString } from 'class-validator';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Length(1, 20)
  name: string;
  @Column()
  executiveSummary: string;
  @Column()
  @MaxLength(15)
  jiraId: string;
  @Column()
  @IsUrl()
  testUrl: string;
  @Column()
  @IsUrl()
  prodUrl: string;
  @Column()
  @MaxLength(250)
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
}
