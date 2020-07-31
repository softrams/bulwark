import { Column, ColumnType, ColumnOptions } from 'typeorm';

const mysqlSqliteTypeMapping: { [key: string]: ColumnType } = {
  mediumblob: 'blob'
};

const resolveDbType = (mySqlType: ColumnType): ColumnType => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  if (isTestEnv && mySqlType in mysqlSqliteTypeMapping) {
    return mysqlSqliteTypeMapping[mySqlType.toString()];
  }
  return mySqlType;
};

export const DbAwareColumn = (columnOptions: ColumnOptions) => {
  if (columnOptions.type) {
    columnOptions.type = resolveDbType(columnOptions.type);
  }
  return Column(columnOptions);
};

export const dynamicNullable = () => {
  const columnOptions: ColumnOptions = {
    nullable: process.env.NODE_ENV === 'test' ? true : false
  };
  return Column(columnOptions);
};
