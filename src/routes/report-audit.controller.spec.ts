import { createConnection, getConnection, Entity, getRepository } from 'typeorm';
import { ReportAudit } from '../entity/ReportAudit';
import { insertReportAuditRecord } from './report-audit.controller';
import { User } from '../entity/User';
import { Assessment } from '../entity/Assessment';
import { Organization } from '../entity/Organization';
import { Vulnerability } from '../entity/Vulnerability';
import { Asset } from '../entity/Asset';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';
import { File } from '../entity/File';
import { Jira } from '../entity/Jira';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from '../utilities/password.utility';
import MockExpressRequest = require('mock-express-request');

describe('Report Audit Controller', () => {
  beforeEach(() => {
    return createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [
        ReportAudit,
        User,
        File,
        Assessment,
        Asset,
        Organization,
        Jira,
        Vulnerability,
        ProblemLocation,
        Resource
      ],
      synchronize: true,
      logging: false
    });
  });

  afterEach(() => {
    const conn = getConnection();
    return conn.close();
  });

  test('insertReportAuditRecord', async () => {
    const req = new MockExpressRequest();
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const savedUser = await getConnection().getRepository(User).save(existUser);
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
    const savedAssessment = await getConnection().getRepository(Assessment).save(assessment);
    req.user = savedUser.id;
    const auditRecord = await insertReportAuditRecord(req.user, savedAssessment.id);
    const savedAuditRecord = await getConnection().getRepository(ReportAudit).findOne(auditRecord.id);
    expect(savedAuditRecord.assessmentId).toBe(savedAssessment.id);
  });
});
