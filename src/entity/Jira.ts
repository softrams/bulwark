import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { IsUrl, IsNotEmpty } from 'class-validator';
import { Asset } from './Asset';

@Entity()
export class Jira {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @IsUrl()
  @IsNotEmpty()
  host: string;
  @Column()
  @IsNotEmpty()
  apiKey: string;
  @Column()
  @IsNotEmpty()
  username: string;
  @OneToOne((type) => Asset, (asset) => asset.jira, { onDelete: 'CASCADE' })
  @JoinColumn()
  asset: Asset;
}
