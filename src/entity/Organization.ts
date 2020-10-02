import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { File } from './File';
import { Asset } from './Asset';
import { IsIn } from 'class-validator';

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
}
