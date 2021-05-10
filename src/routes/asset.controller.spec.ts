import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import * as assetController from './asset.controller';
import {
  createConnection,
  getConnection,
  Entity,
  getRepository,
} from 'typeorm';
import { File } from '../entity/File';
import { Vulnerability } from '../entity/Vulnerability';
import { Assessment } from '../entity/Assessment';
import { User } from '../entity/User';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';
import MockExpressResponse = require('mock-express-response');
import MockExpressRequest = require('mock-express-request');
import { Jira } from '../entity/Jira';
import { Team } from '../entity/Team';
import { ApiKey } from '../entity/ApiKey';
describe('Asset Controller', () => {
  beforeEach(async () => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [
        Asset,
        Organization,
        File,
        Vulnerability,
        Assessment,
        User,
        ProblemLocation,
        Resource,
        Jira,
        Team,
        ApiKey,
      ],
      synchronize: true,
      logging: false,
      name: 'default',
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
        assetId: null,
      },
    });
    await assetController.activateAssetById(request, response);
    expect(response.statusCode).toBe(400);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        assetId: 999,
      },
    });
    await assetController.activateAssetById(request2, response2);
    expect(response2.statusCode).toBe(404);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'AH',
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(insertAsset);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        assetId: 1,
      },
    });
    await assetController.activateAssetById(request3, response3);
    expect(response3.statusCode).toBe(200);
  });
  test('Archive Asset By ID', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        assetId: null,
      },
    });
    await assetController.archiveAssetById(request, response);
    expect(response.statusCode).toBe(400);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        assetId: 999,
      },
    });
    await assetController.archiveAssetById(request2, response2);
    expect(response2.statusCode).toBe(404);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'A',
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(insertAsset);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        assetId: 1,
      },
    });
    await assetController.archiveAssetById(request3, response3);
    expect(response3.statusCode).toBe(200);
  });
  test('Get Active Assets', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        id: null,
      },
    });
    await assetController.getOrgAssets(request, response);
    expect(response.statusCode).toBe(400);
    const request2 = new MockExpressRequest({
      params: {
        id: 'abc',
      },
    });
    const response2 = new MockExpressResponse();
    await assetController.getOrgAssets(request2, response2);
    expect(response2.statusCode).toBe(400);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(org);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'A',
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset = await getConnection()
      .getRepository(Asset)
      .save(insertAsset);
    const request3 = new MockExpressRequest({
      params: {
        id: savedOrg.id,
      },
      userOrgs: [savedOrg.id],
      userAssets: [savedAsset.id],
    });
    const response3 = new MockExpressResponse();
    await assetController.getOrgAssets(request3, response3);
    expect(response3._getJSON()).toHaveLength(1);
    const request4 = new MockExpressRequest({
      params: {
        id: savedOrg.id,
      },
    });
    const response4 = new MockExpressResponse();
    await assetController.getOrgAssets(request4, response4);
    expect(response4.statusCode).toBe(404);
  });
  test('Get Archived Assets', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        id: null,
      },
    });
    await assetController.getArchivedOrgAssets(request, response);
    expect(response.statusCode).toBe(400);
    const request2 = new MockExpressRequest({
      params: {
        id: 'abc',
      },
    });
    const response2 = new MockExpressResponse();
    await assetController.getArchivedOrgAssets(request2, response2);
    expect(response2.statusCode).toBe(400);
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const insertAsset: Asset = {
      id: null,
      name: 'testAsset',
      status: 'AH',
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset = await getConnection()
      .getRepository(Asset)
      .save(insertAsset);
    const request3 = new MockExpressRequest({
      params: {
        id: 1,
      },
      userOrgs: [savedOrg.id],
      userAssets: [savedAsset.id],
    });
    const response3 = new MockExpressResponse();
    await assetController.getArchivedOrgAssets(request3, response3);
    expect(response3._getJSON()).toHaveLength(1);
    const request4 = new MockExpressRequest({
      params: {
        id: savedOrg.id,
      },
    });
    const response4 = new MockExpressResponse();
    await assetController.getArchivedOrgAssets(request4, response4);
    expect(response4.statusCode).toBe(404);
  });
  test('Purge jira info success', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    let savedAsset = await getConnection().getRepository(Asset).findOne(1);
    const jira: Jira = {
      id: null,
      username: 'test',
      host: 'test',
      apiKey: 'test',
      asset: null,
    };
    await getConnection().getRepository(Asset).save(savedAsset);
    savedAsset = await getConnection().getRepository(Asset).findOne(1);
    jira.asset = savedAsset;
    await getConnection().getRepository(Jira).insert(jira);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
    });
    const response = new MockExpressResponse();
    await assetController.purgeJiraInfo(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('Purge jira info failure', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
    });
    const response = new MockExpressResponse();
    await assetController.purgeJiraInfo(request, response);
    expect(response.statusCode).toBe(400);
    const request2 = new MockExpressRequest({
      params: {
        assetId: 'test',
      },
    });
    const response2 = new MockExpressResponse();
    await assetController.purgeJiraInfo(request2, response2);
    expect(response2.statusCode).toBe(400);
  });
  test('Create Asset no jira success', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        name: 'test asset',
        jira: null,
      },
    });
    const response = new MockExpressResponse();
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    await getConnection().getRepository(Organization).findOne(1);
    await assetController.createAsset(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('Create Asset with jira success', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        name: 'test asset',
        jira: {
          username: 'test',
          apiKey: 'test',
          host: 'test',
        },
      },
    });
    const response = new MockExpressResponse();
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    await assetController.createAsset(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('Create Asset failure org id not valid', async () => {
    const request = new MockExpressRequest({
      params: {
        badId: 1,
      },
      body: {
        name: 'test asset',
        jira: {
          username: 'test',
          apiKey: 'test',
          host: 'test',
        },
      },
    });
    const response = new MockExpressResponse();
    await assetController.createAsset(request, response);
    expect(response.statusCode).toBe(400);
  });
  test('Create Asset failure org does not exist', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        name: 'test asset',
        jira: {
          username: 'test',
          apiKey: 'test',
          host: 'test',
        },
      },
    });
    const response = new MockExpressResponse();
    await assetController.createAsset(request, response);
    expect(response.statusCode).toBe(404);
  });
  test('Create Asset failure missing name', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        jira: {
          username: 'test',
          apiKey: 'test',
          host: 'test',
        },
      },
    });
    const response = new MockExpressResponse();
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    await assetController.createAsset(request, response);
    expect(response.statusCode).toBe(400);
  });
  test('Get asset by id success', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      userAssets: [1],
    });
    const response = new MockExpressResponse();
    await assetController.getAssetById(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('Get asset by id failure no access', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      userAssets: [2],
    });
    const response = new MockExpressResponse();
    await assetController.getAssetById(request, response);
    expect(response.statusCode).toBe(404);
  });
  test('get asset by id failure', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
    });
    const response = new MockExpressResponse();
    await assetController.getAssetById(request, response);
    expect(response.statusCode).toBe(400);
  });
  test('Get asset by id failure asset does not exist', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(org);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    const savedAsset = await getConnection().getRepository(Asset).save(asset);
    const request = new MockExpressRequest({
      params: {
        assetId: 2,
      },
      userAssets: [2],
    });
    const response = new MockExpressResponse();
    await assetController.getAssetById(request, response);
    expect(response.statusCode).toBe(404);
  });
  test('Get asset by id success delete api key', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    const savedAsset = await getConnection().getRepository(Asset).findOne(1);
    const jira: Jira = {
      id: null,
      username: 'test',
      host: 'test',
      apiKey: 'test',
      asset: savedAsset,
    };
    await getConnection().getRepository(Jira).insert(jira);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      userAssets: [1],
    });
    const response = new MockExpressResponse();
    await assetController.getAssetById(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('Update by asset id success', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    await getConnection().getRepository(Asset).findOne(1);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      body: {
        name: 'updated asset',
        jira: {
          id: null,
          host: 'test',
          username: 'test',
          apiKey: 'test',
        } as Jira,
      },
    });
    const response = new MockExpressResponse();
    await assetController.updateAssetById(request, response);
    expect(response.statusCode).toBe(200);
  });
  test('Update asset by id failure asset id is not valid', async () => {
    const request = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        name: 'updated asset',
        jira: {
          id: null,
          host: 'test',
          username: 'test',
          apiKey: 'test',
        } as Jira,
      },
    });
    const response = new MockExpressResponse();
    await assetController.updateAssetById(request, response);
    expect(response.statusCode).toBe(400);
  });
  test('Update asset by id failure asset does not exist', async () => {
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      body: {
        name: 'updated asset',
        jira: {
          id: null,
          host: 'test',
          username: 'test',
          apiKey: 'test',
        } as Jira,
      },
    });
    const response = new MockExpressResponse();
    await assetController.updateAssetById(request, response);
    expect(response.statusCode).toBe(404);
  });
  test('Update by asset id failure missing name', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    await getConnection().getRepository(Asset).findOne(1);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      body: {
        jira: {
          id: null,
          host: 'test',
          username: 'test',
          apiKey: 'test',
        } as Jira,
      },
    });
    const response = new MockExpressResponse();
    await assetController.updateAssetById(request, response);
    expect(response.statusCode).toBe(400);
  });
  test('Update by asset id failure jira integration', async () => {
    const org: Organization = {
      id: null,
      name: 'testOrg',
      asset: null,
      status: 'A',
      teams: null,
    };
    await getConnection().getRepository(Organization).insert(org);
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .findOne(1);
    const assessments: Assessment[] = [];
    const asset: Asset = {
      id: null,
      name: 'Test Asset',
      status: 'A',
      assessment: assessments,
      organization: savedOrg,
      jira: null,
      teams: null,
    };
    await getConnection().getRepository(Asset).insert(asset);
    await getConnection().getRepository(Asset).findOne(1);
    const request = new MockExpressRequest({
      params: {
        assetId: 1,
      },
      body: {
        name: 'test',
        jira: {
          id: null,
          host: 1,
          username: 1,
          apiKey: 1,
        },
      },
    });
    const response = new MockExpressResponse();
    await assetController.updateAssetById(request, response);
    expect(response.statusCode).toBe(400);
  });
});
