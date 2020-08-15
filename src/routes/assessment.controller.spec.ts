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

describe('Assessment Controller', () => {
  beforeEach(async () => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Asset, Organization, File, Vulnerability, Assessment, User, ProblemLocation, Resource, Jira],
      synchronize: true,
      logging: false,
      name: 'default'
    });
  });
  afterEach(() => {
    const conn = getConnection('default');
    return conn.close();
  });
  test('Assessment Delete', async () => {
    const response = new MockExpressResponse();
    const request = new MockExpressRequest({
      params: {
        assessmentId: 'abc'
      }
    });
    await assessmentController.deleteAssessmentById(request, response);
    expect(response.statusCode).toBe(400);
    const response2 = new MockExpressResponse();
    const request2 = new MockExpressRequest({
      params: {
        assessmentId: null
      }
    });
    await assessmentController.deleteAssessmentById(request2, response2);
    expect(response2.statusCode).toBe(400);
    const response3 = new MockExpressResponse();
    const request3 = new MockExpressRequest({
      params: {
        assessmentId: 3
      }
    });
    await assessmentController.deleteAssessmentById(request3, response3);
    expect(response3.statusCode).toBe(404);
    const assessment: Assessment = {
      id: null,
      name: 'testAssessment',
      executiveSummary: '',
      jiraId: '',
      testUrl: '',
      prodUrl: '',
      scope: '',
      tag: '',
      startDate: new Date(),
      endDate: new Date(),
      asset: new Asset(),
      testers: null,
      vulnerabilities: null
    };
    await getConnection().getRepository(Assessment).insert(assessment);
    const response4 = new MockExpressResponse();
    const request4 = new MockExpressRequest({
      params: {
        assessmentId: 1
      }
    });
    await assessmentController.deleteAssessmentById(request4, response4);
    expect(response4.statusCode).toBe(200);
  });
});
