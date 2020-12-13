import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsDate } from 'class-validator';

@Entity()
export class ReportAudit {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  assessmentId: number;
  @Column()
  generatedBy: number;
  @Column()
  @IsDate()
  generatedDate: Date;
}
