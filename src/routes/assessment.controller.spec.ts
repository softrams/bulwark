import { getConnection } from 'typeorm';
import { Assessment } from '../entity/Assessment';
import { Asset } from '../entity/Asset';
import { Vulnerability } from '../entity/Vulnerability';
import { Organization } from '../entity/Organization';
import { createConnection } from 'typeorm';
import { File } from '../entity/File';
import { User } from '../entity/User';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';
import MockExpressResponse = require('mock-express-response');
import MockExpressRequest = require('mock-express-request');
import * as assessmentController from './assessment.controller';
import { Jira } from '../entity/Jira';
import { Team } from '../entity/Team';
import { ROLE } from '../enums/roles-enum';

describe('Assessment Controller', () => {
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
  test('Assessment Delete', async () => {
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
    let existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    existUser = await getConnection().getRepository(User).save(existUser);
    const vulns: Vulnerability[] = [];
    const team: Team = {
      id: null,
      name: 'test team',
      organization: savedOrg,
      lastUpdatedBy: existUser.id,
      createdBy: existUser.id,
      lastUpdatedDate: new Date(),
      createdDate: new Date(),
      role: ROLE.TESTER,
      assets: [savedAsset],
      users: [existUser],
    };
    const savedTeam = await getConnection().getRepository(Team).save(team);
    const assessment: Assessment = {
      id: null,
      name: 'Test Assessment',
      executiveSummary: 'Lol this is a bad report. Do not read',
      jiraId: 'not a jira id',
      testUrl: 'not a url',
      prodUrl: 'not a url',
      scope: 'everything',
      tag: '1.0.0',
      startDate: new Date(),
      endDate: new Date(),
      asset: savedAsset,
      testers: [existUser],
      vulnerabilities: vulns,
    };
    const savedAssessment = await getConnection()
      .getRepository(Assessment)
      .save(assessment);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        assessmentId: 'abc',
      },
      userTeams: [savedTeam],
    });
    await assessmentController.deleteAssessmentById(request, response);
    expect(response.statusCode).toBe(400);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        assessmentId: null,
      },
      userTeams: [savedTeam],
    });
    await assessmentController.deleteAssessmentById(request2, response2);
    expect(response2.statusCode).toBe(400);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        assessmentId: 3,
      },
      userTeams: [savedTeam],
    });
    await assessmentController.deleteAssessmentById(request3, response3);
    expect(response3.statusCode).toBe(404);
    const response4 = new MockExpressResponse();
    const request4 = new MockExpressRequest({
      params: {
        assessmentId: 1,
      },
      userTeams: [savedTeam],
    });
    await assessmentController.deleteAssessmentById(request4, response4);
    expect(response4.statusCode).toBe(200);
  });
  test('get assessments by asset id', async () => {
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
    let existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    existUser = await getConnection().getRepository(User).save(existUser);
    const vulns: Vulnerability[] = [];
    const team: Team = {
      id: null,
      name: 'test team',
      organization: savedOrg,
      lastUpdatedBy: existUser.id,
      createdBy: existUser.id,
      lastUpdatedDate: new Date(),
      createdDate: new Date(),
      role: ROLE.TESTER,
      assets: [savedAsset],
      users: [existUser],
    };
    const savedTeam = await getConnection().getRepository(Team).save(team);
    const assessment: Assessment = {
      id: null,
      name: 'Test Assessment',
      executiveSummary: 'Lol this is a bad report. Do not read',
      jiraId: 'not a jira id',
      testUrl: 'not a url',
      prodUrl: 'not a url',
      scope: 'everything',
      tag: '1.0.0',
      startDate: new Date(),
      endDate: new Date(),
      asset: savedAsset,
      testers: [existUser],
      vulnerabilities: vulns,
    };
    const savedAssessment = await getConnection()
      .getRepository(Assessment)
      .save(assessment);
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        id: savedAsset.id,
      },
      userTeams: [savedTeam],
    });
    await assessmentController.getAssessmentsByAssetId(request, response);
    expect(response.statusCode).toBe(200);
    expect(response._getJSON().assessments.length).toBe(1);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        blah: 1,
      },
    });
    await assessmentController.getAssessmentsByAssetId(request2, response2);
    expect(response2.statusCode).toBe(400);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        id: 'abc',
      },
    });
    await assessmentController.getAssessmentsByAssetId(request3, response3);
    expect(response3.statusCode).toBe(400);
  });
});
