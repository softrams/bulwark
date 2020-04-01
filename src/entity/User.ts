import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsUUID } from 'class-validator';

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
  @IsUUID()
  uuid: string;
}
