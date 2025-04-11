import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Organization } from './entity/Organization';
import { Asset } from './entity/Asset';
import { Assessment } from './entity/Assessment';
import { Vulnerability } from './entity/Vulnerability';
import { File } from './entity/File';
import { ProblemLocation } from './entity/ProblemLocation';
import { Resource } from './entity/Resource';
import { Jira } from './entity/Jira';
import { ReportAudit } from './entity/ReportAudit';
import { ApiKey } from './entity/ApiKey';
import { Config } from './entity/Config';
import { Team } from './entity/Team';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
if (fs.existsSync(path.join(__dirname, '../.env'))) {
  const envPath = fs.readFileSync(path.join(__dirname, '../.env'));
  console.log('A .env file has been found and will now be parsed.');
  const envConfig = dotenv.parse(envPath);
  if (envConfig) {
    for (const key in envConfig) {
      if (envConfig.hasOwnProperty(key)) {
        process.env[key] = envConfig[key];
      }
    }
    console.log('The provided .env file has been parsed successfully.');
  }
}

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any || 'mysql',
  host: process.env.DB_URL || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    User,
    Organization,
    Asset,
    Assessment,
    Vulnerability,
    File,
    ProblemLocation,
    Resource,
    Jira,
    ReportAudit,
    ApiKey,
    Config,
    Team
  ],
  migrations: [path.join(__dirname, './migration/*.js')],
  subscribers: []
});