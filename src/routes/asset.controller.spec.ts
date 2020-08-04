import { UserRequest } from '../interfaces/user-request.interface';
import { Response, Request } from 'express';
import { Asset } from '../entity/Asset';
import { validate } from 'class-validator';
import { Organization } from '../entity/Organization';
import { status } from '../enums/status-enum';
import * as assetController from './asset.controller';
import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
import { File } from '../entity/File';
import { Vulnerability } from '../entity/Vulnerability';
import { Assessment } from '../entity/Assessment';
import { User } from '../entity/User';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';
import MockExpressResponse = require('mock-express-response');
import MockExpressRequest = require('mock-express-request');

describe('Asset Controller', () => {
  beforeEach(async () => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Asset, Organization, File, Vulnerability, Assessment, User, ProblemLocation, Resource],
      synchronize: true,
      logging: false,
      name: 'default'
    });
  });
  afterEach(() => {
    const conn = getConnection('default');
    return conn.close();
  });
  test('Activate Asset By ID', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        assetId: null
      }
    });
    await assetController.activateAssetById(request, response);
    expect(response.statusCode).toBe(400);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        assetId: 999
      }
    });
    await assetController.activateAssetById(request2, response2);
    expect(response2.statusCode).toBe(404);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      avatar: null,
      asset: null,
      status: 'A'
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection().getRepository(Organization).findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'AH',
      organization: savedOrg,
      assessment: assessments,
      jiraApiKey: '',
      jiraHost: '',
      jiraUsername: ''
    };
    await getConnection().getRepository(Asset).insert(insertAsset);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        assetId: 1
      }
    });
    await assetController.activateAssetById(request3, response3);
    expect(response3.statusCode).toBe(200);
  });
  test('Archive Asset By ID', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        assetId: null
      }
    });
    await assetController.archiveAssetById(request, response);
    expect(response.statusCode).toBe(400);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        assetId: 999
      }
    });
    await assetController.archiveAssetById(request2, response2);
    expect(response2.statusCode).toBe(404);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      avatar: null,
      asset: null,
      status: 'A'
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection().getRepository(Organization).findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'A',
      organization: savedOrg,
      assessment: assessments,
      jiraApiKey: '',
      jiraHost: '',
      jiraUsername: ''
    };
    await getConnection().getRepository(Asset).insert(insertAsset);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        assetId: 1
      }
    });
    await assetController.archiveAssetById(request3, response3);
    expect(response3.statusCode).toBe(200);
  });
  test('Get Active Assets', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        id: null
      }
    });
    await assetController.getOrgAssets(request, response);
    expect(response.statusCode).toBe(400);
    const request2 = new MockExpressRequest({
      params: {
        id: 'abc'
      }
    });
    const response2 = new MockExpressResponse();
    await assetController.getOrgAssets(request2, response2);
    expect(response2.statusCode).toBe(400);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      avatar: null,
      asset: null,
      status: 'A'
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection().getRepository(Organization).findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'A',
      organization: savedOrg,
      assessment: assessments,
      jiraApiKey: '',
      jiraHost: '',
      jiraUsername: ''
    };
    await getConnection().getRepository(Asset).insert(insertAsset);
    const request3 = new MockExpressRequest({
      params: {
        id: 1
      }
    });
    const response3 = new MockExpressResponse();
    await assetController.getOrgAssets(request3, response3);
    expect(response3._getJSON()).toHaveLength(1);
  });
  test('Get Archived Assets', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        id: null
      }
    });
    await assetController.getArchivedOrgAssets(request, response);
    expect(response.statusCode).toBe(400);
    const request2 = new MockExpressRequest({
      params: {
        id: 'abc'
      }
    });
    const response2 = new MockExpressResponse();
    await assetController.getArchivedOrgAssets(request2, response2);
    expect(response2.statusCode).toBe(400);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      avatar: null,
      asset: null,
      status: 'A'
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection().getRepository(Organization).findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'AH',
      organization: savedOrg,
      assessment: assessments,
      jiraApiKey: '',
      jiraHost: '',
      jiraUsername: ''
    };
    await getConnection().getRepository(Asset).insert(insertAsset);
    const request3 = new MockExpressRequest({
      params: {
        id: 1
      }
    });
    const response3 = new MockExpressResponse();
    await assetController.getArchivedOrgAssets(request3, response3);
    expect(response3._getJSON()).toHaveLength(1);
  });
});
