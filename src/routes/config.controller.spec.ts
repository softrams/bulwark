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
  test('initalize config', async () => {
    await configController.initialInsert();
    const userAry = await getConnection().getRepository(User).find({});
    const configAry = await getConnection().getRepository(Config).find({});
    const teamAry = await getConnection()
      .getRepository(Team)
      .find({ relations: ['users'] });
    expect(userAry.length).toBe(1);
    expect(configAry.length).toBe(1);
    expect(userAry[0].id).toBe(1);
    expect(userAry[0].firstName).toBe('Master');
    expect(userAry[0].lastName).toBe('Chief');
    expect(userAry[0].email).toBe('admin@example.com');
    expect(userAry[0].title).toBe('Spartan 117');
    expect(userAry[0].active).toBeTruthy();
    expect(teamAry[0].name).toBe('Administrators');
    expect(teamAry[0].users[0].email).toBe('admin@example.com');
    expect(teamAry[0].createdBy && teamAry[0].lastUpdatedBy).toBe(1);
    const initUsrPw = userAry[0].password;
    expect(compare('changeMe', initUsrPw)).toBeTruthy();
  });
  test('initial user exists. teams do not exist', async () => {
    const user = new User();
    user.active = false;
    user.uuid = uuidv4();
    user.email = 'testing@jest.com';
    user.newEmail = null;
    await getConnection().getRepository(User).save(user);
    await configController.initialInsert();
    const teamAry = await getConnection()
      .getRepository(Team)
      .find({ relations: ['users'] });
    expect(teamAry[0].users).toHaveLength(0);
    expect(teamAry[0].createdBy && teamAry[0].lastUpdatedBy).toBeNull();
  });
  test('save configuration success', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = '123';
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      body: {
        fromEmail: 'test@jest.com',
        fromEmailPassword: 'abc123',
        companyName: 'UNFC',
      },
    });
    await configController.saveConfig(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('save configuration fail validation', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = '123';
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      body: {
        fromEmail: 'test',
        fromEmailPassword: 'abc123',
        companyName: 'UNFC',
      },
    });
    await configController.saveConfig(request, response);
    expect(response.statusCode).toBe(400);
  });
  test('patch configuration success', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = '123';
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      body: {
        fromEmail: 'test@jest.com',
        fromEmailPassword: 'abc123',
        companyName: 'UNFC',
      },
    });
    await configController.saveConfig(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('patch configuration fail validation', async () => {
    const config = new Config();
    config.fromEmail = 'testingDude@jest.com';
    config.companyName = 'Test';
    config.fromEmailPassword = '123';
    config.id = 1;
    await getConnection().getRepository(Config).insert(config);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      body: {
        fromEmail: 'test',
        fromEmailPassword: 'abc123',
        companyName: 'UNFC',
      },
    });
    await configController.saveConfig(request, response);
    expect(response.statusCode).toBe(400);
  });
});
