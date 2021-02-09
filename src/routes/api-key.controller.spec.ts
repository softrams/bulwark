import { createConnection, getConnection } from 'typeorm';
import * as configController from './config.controller';
import MockExpressResponse = require('mock-express-response');
import MockExpressRequest = require('mock-express-request');
import { User } from '../entity/User';
import { Team } from '../entity/Team';
import { compare } from '../utilities/password.utility';
import { v4 as uuidv4 } from 'uuid';
import { Assessment } from '../entity/Assessment';
import { Asset } from '../entity/Asset';
import { Jira } from '../entity/Jira';
import { Organization } from '../entity/Organization';
import { ProblemLocation } from '../entity/ProblemLocation';
import { ReportAudit } from '../entity/ReportAudit';
import { Resource } from '../entity/Resource';
import { Vulnerability } from '../entity/Vulnerability';
import { Config } from '../entity/Config';
import { File } from '../entity/File';
import { ApiKey } from '../entity/ApiKey';

describe('config controller', () => {
  beforeEach(() => {
    return createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [
        Config,
        User,
        Team,
        Organization,
        Asset,
        Assessment,
        Vulnerability,
        ProblemLocation,
        ReportAudit,
        Resource,
        Jira,
        File,
        ApiKey,
      ],
      synchronize: true,
      logging: false,
    });
  });
  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });
  test('initalize test', async () => {
    const isOne = 1;
    expect(isOne === 1);
  });
});
