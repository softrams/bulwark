import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsUUID, IsAlpha, IsOptional } from 'class-validator';
import { dynamicNullable } from '../utilities/column-mapper.utility';

@Entity()
export class User {
  @PrimaryGeneratedColumn({})
  id: number;
  @Column({
    unique: true
  })
  @IsEmail()
  email: string;
  @dynamicNullable()
  password: string;
  @Column()
  active: boolean;
  @Column({
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  uuid: string;
  @dynamicNullable()
  firstName: string;
  @dynamicNullable()
  lastName: string;
  @dynamicNullable()
  title: string;
}
