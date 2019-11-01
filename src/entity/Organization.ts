import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Length, MaxLength } from 'class-validator';
import { File } from './File';
import { Asset } from './Asset';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @OneToOne((type) => File, { onDelete: 'CASCADE' })
  @JoinColumn()
  avatar: number;
  @OneToMany((type) => Asset, (asset) => asset.organization)
  asset: Asset[];
}
