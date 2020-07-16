import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsUUID, IsAlpha, IsOptional } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn({})
  id: number;
  @Column({
    unique: true
  })
  @IsEmail()
  email: string;
  @Column({
    nullable: true
  })
  password: string;
  @Column()
  active: boolean;
  @Column({
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  uuid: string;
  @Column({
    nullable: true
  })
  firstName: string;
  @Column({
    nullable: true
  })
  lastName: string;
  @Column({
    nullable: true
  })
  title: string;
}
