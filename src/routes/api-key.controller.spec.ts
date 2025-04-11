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
import {
  deleteApiKeyAsAdmin,
  deleteApiKeyAsUser,
  generateApiKey,
  getAdminApiKeyInfo,
  getUserApiKeyInfo,
} from './api-key.controller';

describe('config controller', () => {
  beforeEach(async () => {
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
  test('Save API Key to User', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
  });

  test('Save Invalid API Key to User', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
  });

  test('Deactivate All Existing API Keys', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request2, response2);
    expect(response2.statusCode).toBe(200);
  });

  test('Delete API Key as User', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
    newUser = await getConnection()
      .getRepository(User)
      .findOne({
        where: { id: newUser.id },
        relations: ['apiKey'],
      });
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      user: newUser.id,
      params: {
        id: newUser.apiKey[0].id,
      },
    });
    await deleteApiKeyAsUser(request2, response2);
    expect(response2.statusCode).toBe(200);
  });

  test('Delete Invalid API Key as User', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
      params: {
        id: 1,
      },
    });
    await deleteApiKeyAsUser(request, response);
    expect(response.statusCode).toBe(404);
  });

  test('Delete No API Key as User', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
      params: {},
    });
    await deleteApiKeyAsUser(request, response);
    expect(response.statusCode).toBe(400);
  });

  test('Delete API Key as Admin', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
    newUser = await getConnection()
      .getRepository(User)
      .findOne({
        where: { id: newUser.id },
        relations: ['apiKey'],
      });
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      user: newUser.id,
      params: {
        id: newUser.apiKey[0].id,
      },
    });
    await deleteApiKeyAsAdmin(request2, response2);
    expect(response2.statusCode).toBe(200);
  });

  test('Delete Invalid API Key as Admin', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
      params: {
        id: 1,
      },
    });
    await deleteApiKeyAsAdmin(request, response);
    expect(response.statusCode).toBe(404);
  });

  test('Delete No API Key as Admin', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
      params: {},
    });
    await deleteApiKeyAsAdmin(request, response);
    expect(response.statusCode).toBe(400);
  });

  test('Fetch User API Key Info', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
    newUser = await getConnection()
      .getRepository(User)
      .findOne({
        where: { id: newUser.id },
        relations: ['apiKey'],
      });
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      user: newUser.id,
    });
    await getUserApiKeyInfo(request2, response2);
    expect(response2.statusCode).toBe(200);
    expect(response2._getJSON().id).toBe(newUser.apiKey[0].id);
  });

  test('Fetch User No API Key Info', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    newUser = await getConnection()
      .getRepository(User)
      .findOne({
        where: { id: newUser.id },
        relations: ['apiKey'],
      });
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      user: newUser.id,
    });
    await getUserApiKeyInfo(request2, response2);
    expect(response2.statusCode).toBe(200);
    expect(response2._getJSON()).toBe(null);
  });

  test('Fetch Admin API Key Info', async () => {
    let newUser = new User();
    newUser.firstName = 'master';
    newUser.lastName = 'chief';
    newUser.email = 'testing@jest.com';
    newUser.active = true;
    newUser = await getConnection().getRepository(User).save(newUser);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      user: newUser.id,
    });
    await generateApiKey(request, response);
    expect(response.statusCode).toBe(200);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      user: newUser.id,
    });
    await getAdminApiKeyInfo(request2, response2);
    expect(response2.statusCode).toBe(200);
    expect(response2._getJSON().length).toBe(1);
  });
});
