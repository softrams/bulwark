import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Asset } from './Asset';
import { Length, IsUrl, IsDate, MaxLength } from 'class-validator';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Length(1, 20)
  name: string;
  @Column()
  @MaxLength(1500)
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
  @MaxLength(10)
  tag: number;
  @Column()
  @IsDate()
  startDate: Date;
  @Column()
  @IsDate()
  endDate: Date;
  @ManyToOne((type) => Asset, (asset) => asset.id)
  asset: Asset;
}
