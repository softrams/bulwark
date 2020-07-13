import { createConnection, getConnection, Entity, getRepository, Repository } from 'typeorm';
import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Assessment } from '../entity/Assessment';
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';

describe('assessment controller', () => {
  const testConnectionName = 'testConnection';
  let repository: Repository<Assessment>;

  beforeEach(async () => {
    const connection = await createConnection({
      name: testConnectionName,
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Assessment, Asset, Organization],
      synchronize: true,
      logging: false
    });
    repository = getRepository(Assessment, testConnectionName);
    return connection;
  });

  afterEach(async () => {
    await getConnection(testConnectionName).close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('get assessment by asset ID', async () => {
    await repository.insert({
      name: 'assessment 1',
      executiveSummary: '',
      jiraId: '',
      testUrl: '',
      prodUrl: '',
      scope: '',
      tag: '',
      startDate: new Date(),
      endDate: new Date(),
      vulnerabilities: [],
      testers: []
    });
    const assessment = await getRepository(Assessment).findOne(1);
    expect(assessment.name).toBe('assessment 1');
  });
});
