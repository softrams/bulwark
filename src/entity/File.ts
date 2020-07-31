import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ColumnType, ColumnOptions } from 'typeorm';
import { Vulnerability } from './Vulnerability';

// TODO: Move to common file for reuse
const mysqlSqliteTypeMapping: { [key: string]: ColumnType } = {
  mediumblob: 'blob'
};

export function resolveDbType(mySqlType: ColumnType): ColumnType {
  const isTestEnv = process.env.NODE_ENV === 'test';
  if (isTestEnv && mySqlType in mysqlSqliteTypeMapping) {
    return mysqlSqliteTypeMapping[mySqlType.toString()];
  }
  return mySqlType;
}

export function DbAwareColumn(columnOptions: ColumnOptions) {
  if (columnOptions.type) {
    columnOptions.type = resolveDbType(columnOptions.type);
  }
  return Column(columnOptions);
}
@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fieldName: string;
  @Column()
  originalname: string;
  @Column()
  encoding: string;
  @Column()
  mimetype: string;
  @DbAwareColumn({ name: 'buffer', type: 'mediumblob' })
  buffer: Buffer;
  @Column()
  size: number;
  @ManyToOne((type) => Vulnerability, (vuln) => vuln.screenshots, { onDelete: 'CASCADE' })
  vulnerability: Vulnerability;
}
