import { Column, ColumnType, ColumnOptions } from 'typeorm';

const mysqlSqliteTypeMapping: { [key: string]: ColumnType } = {
  mediumblob: 'blob'
};

const resolveDbType = (mySqlType: ColumnType): ColumnType => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  if (isTestEnv && mySqlType.toString() in mysqlSqliteTypeMapping) {
    return mysqlSqliteTypeMapping[mySqlType.toString()];
  }
  return mySqlType;
};
/**
 * @description Wrapper function for resolving DB Type
 * @param {ColumnOptions} columnOptions
 * @returns Custom Column
 */
export const DbAwareColumn = (columnOptions: ColumnOptions) => {
  if (columnOptions.type) {
    columnOptions.type = resolveDbType(columnOptions.type);
  }
  return Column(columnOptions);
};
/**
 * @description Addes nullabe column option if test DB is active
 * @returns Custom Column
 */
export const dynamicNullable = () => {
  const columnOptions: ColumnOptions = {
    nullable: process.env.NODE_ENV === 'test' ? true : false
  };
  return Column(columnOptions);
};
