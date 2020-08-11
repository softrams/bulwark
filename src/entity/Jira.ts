import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { IsUrl } from 'class-validator';
import { Asset } from './Asset';

@Entity()
export class Jira {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @IsUrl()
  host: string;
  @Column()
  apiKey: string;
  @Column()
  username: string;
  @OneToOne((type) => Asset, (asset) => asset.jira)
  @JoinColumn()
  asset: Asset;
}
