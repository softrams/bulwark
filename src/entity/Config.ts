import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail } from 'class-validator';

@Entity()
export class Config {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    nullable: true
  })
  @IsEmail()
  fromEmail: string;
  @Column({
    nullable: true
  })
  fromEmailPassword: string;
  @Column({
    nullable: true
  })
  companyName: string;
}
