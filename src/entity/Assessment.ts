import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Asset } from './Asset';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @ManyToOne(type => Asset, asset => asset.id)
  asset: Asset;
}
