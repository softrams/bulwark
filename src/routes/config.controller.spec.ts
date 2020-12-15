import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
import * as configController from './config.controller';
import { Config } from '../entity/Config';
import MockExpressResponse = require('mock-express-response');
import MockExpressRequest = require('mock-express-request');
import { User } from '../entity/User';
import { Team } from '../entity/Team';
import { compare } from '../utilities/password.utility';
import { v4 as uuidv4 } from 'uuid';

describe('config controller', () => {
  beforeEach(() => {
    return createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Config, User, Team],
      synchronize: true,
      logging: false
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
    expect(teamAry.length).toBe(3);
    expect(teamAry[0].name).toBe('Administrators');
    expect(teamAry[0].users[0].email).toBe('admin@example.com');
    expect(teamAry[0].createdBy && teamAry[0].lastUpdatedBy).toBe(1);
    expect(teamAry[1].name).toBe('Global Testers');
    expect(teamAry[1].createdBy && teamAry[1].lastUpdatedBy).toBe(1);
    expect(teamAry[2].name).toBe('Global Read-Only');
    expect(teamAry[2].createdBy && teamAry[2].lastUpdatedBy).toBe(1);
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
    expect(teamAry[1].users).toHaveLength(0);
    expect(teamAry[1].createdBy && teamAry[1].lastUpdatedBy).toBeNull();
    expect(teamAry[2].users).toHaveLength(0);
    expect(teamAry[2].createdBy && teamAry[2].lastUpdatedBy).toBeNull();
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
        companyName: 'UNFC'
      }
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
        companyName: 'UNFC'
      }
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
        companyName: 'UNFC'
      }
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
        companyName: 'UNFC'
      }
    });
    await configController.saveConfig(request, response);
    expect(response.statusCode).toBe(400);
  });
});
