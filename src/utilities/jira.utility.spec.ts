import * as jiraUtility from './jira.utility';
import { createConnection, getConnection } from 'typeorm';
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import { Vulnerability } from '../entity/Vulnerability';
import { Assessment } from '../entity/Assessment';
import { User } from '../entity/User';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';
import { Jira } from '../entity/Jira';
// TODO: Figure out how to mock jira-client API calls so that we do not hit the atlassian API's
describe('jira utility db', () => {
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
});
describe('jira utility mapping functions', () => {
  test('map risk to severity informational', () => {
    let risk = 'Informational';
    expect(jiraUtility.mapRiskToSeverity(risk)).toBe('Lowest');
    risk = 'Low';
    expect(jiraUtility.mapRiskToSeverity(risk)).toBe('Low');
    risk = 'Medium';
    expect(jiraUtility.mapRiskToSeverity(risk)).toBe('Medium');
    risk = 'High';
    expect(jiraUtility.mapRiskToSeverity(risk)).toBe('High');
    risk = 'Critical';
    expect(jiraUtility.mapRiskToSeverity(risk)).toBe('Highest');
    risk = 'Random';
    expect(jiraUtility.mapRiskToSeverity(risk)).toBe('');
  });
  test('map vuln to jira issue', async () => {
    const resources: Resource[] = [];
    const probLoc: ProblemLocation[] = [];
    const assessment: Assessment = null;
    const vuln: Vulnerability = {
      id: 1,
      jiraId: '',
      impact: 'low',
      risk: 'low',
      likelihood: 'low',
      systemic: 'Yes',
      cvssScore: 1.0,
      status: 'Open',
      description: 'Test description',
      detailedInfo: 'Test detailed description',
      remediation: 'Test remediation',
      name: 'SQL Injection',
      resources,
      problemLocations: probLoc,
      assessment,
      cvssUrl: 'http://test.com',
      screenshots: null
    };
    const firstProbLoc: ProblemLocation = {
      id: 1,
      target: '',
      vulnerability: vuln,
      location: ''
    };
    const resource: Resource = {
      id: 1,
      description: 'test',
      vulnerability: vuln,
      url: 'http://test.com'
    };
    vuln.problemLocations.push(firstProbLoc);
    vuln.resources.push(resource);
    expect(await jiraUtility.mapVulnToJiraIssue(vuln, 'test-123')).toBeDefined();
  });
  test('get issue key', () => {
    const jiraUrl = 'https://bulwark-test.atlassian.net/browse/tst-1';
    expect(jiraUtility.getIssueKey(jiraUrl)).toBe('tst-1');
  });
});
