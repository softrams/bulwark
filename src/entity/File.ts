import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fieldName: string;
  @Column()
  originalName: string;
  @Column()
  encoding: string;
  @Column()
  mimetype: string;
  @Column()
  buffer: Buffer;
  @Column()
  size: number;
}
