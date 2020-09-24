import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
import * as configController from './config.controller';
import { Config } from '../entity/Config';
import MockExpressResponse = require('mock-express-response');
import MockExpressRequest = require('mock-express-request');

describe('config controller', () => {
  beforeEach(() => {
    return createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Config],
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
