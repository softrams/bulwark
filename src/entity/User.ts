import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { IsEmail, IsUUID, IsOptional } from 'class-validator';
import { dynamicNullable } from '../utilities/column-mapper.utility';
import { Team } from '../entity/Team';

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
  @IsEmail()
  newEmail: string;
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
  @ManyToMany(() => Team, (team) => team.users)
  teams: Team[];
}
