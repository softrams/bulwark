import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsUUID, IsAlpha, IsOptional } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    unique: true
  })
  @IsEmail()
  email: string;
  @Column()
  password: string;
  @Column()
  active: boolean;
  @Column()
  @IsOptional()
  @IsUUID()
  uuid: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  title: string;
}
