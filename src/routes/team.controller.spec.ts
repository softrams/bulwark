import { createConnection, getConnection } from 'typeorm';
import { ReportAudit } from '../entity/ReportAudit';
import { User } from '../entity/User';
import { Assessment } from '../entity/Assessment';
import { Organization } from '../entity/Organization';
import { Vulnerability } from '../entity/Vulnerability';
import { Asset } from '../entity/Asset';
import { ProblemLocation } from '../entity/ProblemLocation';
import { Resource } from '../entity/Resource';
import { File } from '../entity/File';
import { Jira } from '../entity/Jira';
import { Team } from '../entity/Team';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from '../utilities/password.utility';
import MockExpressRequest = require('mock-express-request');
import MockExpressResponse = require('mock-express-response');
import { ROLE } from '../enums/roles-enum';
import { status } from '../enums/status-enum';
import { ApiKey } from '../entity/ApiKey';
import {
  createTeam,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
  updateTeamInfo,
  getMyTeams,
  addTeamAsset,
  removeTeamAsset,
  getAllTeams,
} from '../routes/team.controller';

describe('Team Controller', () => {
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
        Resource,
        Team,
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

  test('Create Team', async () => {
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const savedUser = await getConnection().getRepository(User).save(existUser);
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    // create assets
    const asset: Asset = {
      organization: savedOrg,
      name: 'Test Asset 1',
      status: 'A',
      id: null,
      jira: null,
      assessment: null,
      teams: null,
    };
    const savedAsset = await getConnection().getRepository(Asset).save(asset);
    const asset2: Asset = {
      organization: savedOrg,
      name: 'Test Asset 1',
      status: 'A',
      id: null,
      jira: null,
      assessment: null,
      teams: null,
    };
    const savedAsset2 = await getConnection().getRepository(Asset).save(asset2);
    const asset3: Asset = {
      organization: savedOrg,
      name: 'Test Asset 1',
      status: 'A',
      id: null,
      jira: null,
      assessment: null,
      teams: null,
    };
    const savedAsset3 = await getConnection().getRepository(Asset).save(asset3);
    const assetAry: Asset[] = [];
    const request = new MockExpressRequest({
      body: {
        id: null,
        name: 'Test Team',
        organization: savedOrg.id,
        asset: null,
        role: ROLE.ADMIN,
        assetIds: [savedAsset.id, savedAsset2.id],
        users: [savedUser.id],
      },
      user: savedUser.id,
    });
    const response = new MockExpressResponse();
    await createTeam(request, response);
    expect(response.statusCode).toBe(200);
    const teams = await getConnection()
      .getRepository(Team)
      .find({ relations: ['users', 'assets'] });
    expect(teams.length).toBe(1);
    expect(teams[0].users.length).toBe(1);
    expect(teams[0].assets.length).toBe(2);
  });

  test('Create Team Failure', async () => {
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const savedUser = await getConnection().getRepository(User).save(existUser);
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    const badRequest = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        id: null,
        name: 'test',
        organization: savedOrg.id,
        asset: null,
        role: 'not a role',
        users: [],
      },
      user: savedUser.id,
    });
    const badResponse = new MockExpressResponse();
    await createTeam(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const teams = await getConnection().getRepository(Team).find({});
    expect(teams.length).toBe(0);
    const badRequest2 = new MockExpressRequest({
      params: {
        id: 1,
      },
      body: {
        id: null,
        name: 'test',
        organization: 3,
        asset: null,
        role: 'not a role',
        users: [],
      },
      user: savedUser.id,
    });
    const badResponse2 = new MockExpressResponse();
    await createTeam(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(404);
  });

  test('add team member', async () => {
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    // user 1
    const teamMember1 = new User();
    teamMember1.firstName = 'master';
    teamMember1.lastName = 'chief';
    teamMember1.email = 'testing1@jest.com';
    teamMember1.active = true;
    const uuid = uuidv4();
    teamMember1.uuid = uuid;
    teamMember1.password = await generateHash('TangoDown123!!!');
    const addedUser1 = await getConnection()
      .getRepository(User)
      .save(teamMember1);
    // user 2
    const teamMember2 = new User();
    teamMember2.firstName = 'master';
    teamMember2.lastName = 'chief';
    teamMember2.email = 'testing2@jest.com';
    teamMember2.active = true;
    const uuid2 = uuidv4();
    teamMember2.uuid = uuid2;
    teamMember2.password = await generateHash('TangoDown123!!!');
    const addedUser2 = await getConnection()
      .getRepository(User)
      .save(teamMember2);
    // user 3
    const teamMember3 = new User();
    teamMember3.firstName = 'master';
    teamMember3.lastName = 'chief';
    teamMember3.email = 'testing3@jest.com';
    teamMember3.active = true;
    const uuid3 = uuidv4();
    teamMember3.uuid = uuid3;
    teamMember3.password = await generateHash('TangoDown123!!!');
    const addedUser3 = await getConnection()
      .getRepository(User)
      .save(teamMember3);
    // create team
    const bravoTeam = new Team();
    bravoTeam.name = 'Bravo';
    bravoTeam.organization = savedOrg;
    bravoTeam.id = null;
    bravoTeam.createdDate = new Date();
    bravoTeam.lastUpdatedDate = new Date();
    bravoTeam.createdBy = 0;
    bravoTeam.lastUpdatedBy = 0;
    bravoTeam.role = ROLE.READONLY;
    const savedTeam = await getConnection().getRepository(Team).save(bravoTeam);
    const request = new MockExpressRequest({
      body: {
        userIds: [1, 2, 3],
        teamId: savedTeam.id,
      },
    });
    const response = new MockExpressResponse();
    await addTeamMember(request, response);
    expect(response.statusCode).toBe(200);
    const badRequest2 = new MockExpressRequest({
      body: {
        userIds: [1, 2, 3],
        teamId: 'lol',
      },
    });
    const badResponse2 = new MockExpressResponse();
    await addTeamMember(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(404);
    const badRequest3 = new MockExpressRequest({
      body: {
        userIds: [1, 2, 3],
      },
    });
    const badResponse3 = new MockExpressResponse();
    await addTeamMember(badRequest3, badResponse3);
    expect(badResponse3.statusCode).toBe(400);
    const team = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['users'] });
    expect(team.users.length).toBe(3);
  });

  test('remove team member', async () => {
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    // user 1
    const teamMember1 = new User();
    teamMember1.firstName = 'master';
    teamMember1.lastName = 'chief';
    teamMember1.email = 'testing1@jest.com';
    teamMember1.active = true;
    const uuid = uuidv4();
    teamMember1.uuid = uuid;
    teamMember1.password = await generateHash('TangoDown123!!!');
    const addedUser1 = await getConnection()
      .getRepository(User)
      .save(teamMember1);
    // user 2
    const teamMember2 = new User();
    teamMember2.firstName = 'master';
    teamMember2.lastName = 'chief';
    teamMember2.email = 'testing2@jest.com';
    teamMember2.active = true;
    const uuid2 = uuidv4();
    teamMember2.uuid = uuid2;
    teamMember2.password = await generateHash('TangoDown123!!!');
    const addedUser2 = await getConnection()
      .getRepository(User)
      .save(teamMember2);
    // user 3
    const teamMember3 = new User();
    teamMember3.firstName = 'master';
    teamMember3.lastName = 'chief';
    teamMember3.email = 'testing3@jest.com';
    teamMember3.active = true;
    const uuid3 = uuidv4();
    teamMember3.uuid = uuid3;
    teamMember3.password = await generateHash('TangoDown123!!!');
    const addedUser3 = await getConnection()
      .getRepository(User)
      .save(teamMember3);
    // create team
    const bravoTeam = new Team();
    bravoTeam.name = 'Bravo';
    bravoTeam.organization = savedOrg;
    bravoTeam.id = null;
    bravoTeam.createdDate = new Date();
    bravoTeam.lastUpdatedDate = new Date();
    bravoTeam.createdBy = 0;
    bravoTeam.lastUpdatedBy = 0;
    bravoTeam.role = ROLE.READONLY;
    const savedTeam = await getConnection().getRepository(Team).save(bravoTeam);
    let fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['users'] });
    expect(fetchTeam.users.length).toBe(0);
    fetchTeam.users.push(addedUser1, addedUser2, addedUser3);
    fetchTeam = await getConnection().getRepository(Team).save(fetchTeam);
    fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: fetchTeam.id }, relations: ['users'] });
    expect(fetchTeam.users.length).toBe(3);
    const request = new MockExpressRequest({
      body: {
        userIds: [1],
        teamId: savedTeam.id,
      },
    });
    const response = new MockExpressResponse();
    await removeTeamMember(request, response);
    expect(response.statusCode).toBe(200);
    fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: fetchTeam.id }, relations: ['users'] });
    expect(fetchTeam.users.length).toBe(2);
    const badRequest = new MockExpressRequest({
      body: {
        userIds: [1],
      },
    });
    const badResponse = new MockExpressResponse();
    await removeTeamMember(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const badRequest2 = new MockExpressRequest({
      body: {
        userIds: [1],
        teamId: 6,
      },
    });
    const badResponse2 = new MockExpressResponse();
    await removeTeamMember(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(404);
    const badRequest3 = new MockExpressRequest({
      body: {
        userIds: [2, 6],
        teamId: savedTeam.id,
      },
    });
    const badResponse3 = new MockExpressResponse();
    await removeTeamMember(badRequest3, badResponse3);
    expect(badResponse3.statusCode).toBe(404);
  });

  test('update team info', async () => {
    // create user
    const existUser = new User();
    existUser.firstName = 'master';
    existUser.lastName = 'chief';
    existUser.email = 'testing@jest.com';
    existUser.active = true;
    const uuid = uuidv4();
    existUser.uuid = uuid;
    existUser.password = await generateHash('TangoDown123!!!');
    const savedUser = await getConnection().getRepository(User).save(existUser);
    // create user
    const existUser2 = new User();
    existUser2.firstName = 'master';
    existUser2.lastName = 'chief';
    existUser2.email = 'testing2@jest.com';
    existUser2.active = true;
    const uuid2 = uuidv4();
    existUser2.uuid = uuid2;
    existUser2.password = await generateHash('TangoDown123!!!');
    const savedUser2 = await getConnection()
      .getRepository(User)
      .save(existUser2);
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    // create assets
    const asset: Asset = {
      organization: savedOrg,
      name: 'Test Asset 1',
      status: 'A',
      id: null,
      jira: null,
      assessment: null,
      teams: null,
    };
    const savedAsset = await getConnection().getRepository(Asset).save(asset);
    const asset2: Asset = {
      organization: savedOrg,
      name: 'Test Asset 1',
      status: 'A',
      id: null,
      jira: null,
      assessment: null,
      teams: null,
    };
    const savedAsset2 = await getConnection().getRepository(Asset).save(asset2);
    const asset3: Asset = {
      organization: savedOrg,
      name: 'Test Asset 1',
      status: 'A',
      id: null,
      jira: null,
      assessment: null,
      teams: null,
    };
    const savedAsset3 = await getConnection().getRepository(Asset).save(asset3);
    const assetAry: Asset[] = [];
    assetAry.push(savedAsset, savedAsset2);
    // create team
    const bravoTeam = new Team();
    bravoTeam.name = 'Bravo';
    bravoTeam.organization = savedOrg;
    bravoTeam.id = null;
    bravoTeam.createdDate = new Date();
    bravoTeam.lastUpdatedDate = new Date();
    bravoTeam.createdBy = 0;
    bravoTeam.lastUpdatedBy = 0;
    bravoTeam.role = ROLE.READONLY;
    bravoTeam.assets = assetAry;
    bravoTeam.users = [savedUser];
    const savedTeam = await getConnection().getRepository(Team).save(bravoTeam);
    expect(savedTeam.assets.length).toBe(2);
    expect(savedTeam.users.length).toBe(1);
    const request = new MockExpressRequest({
      body: {
        name: 'Alpha',
        organization: savedOrg.id,
        asset: null,
        role: ROLE.TESTER,
        id: savedTeam.id,
        users: [savedUser, savedUser2],
        assetIds: [],
      },
    });
    const response = new MockExpressResponse();
    await updateTeamInfo(request, response);
    expect(response.statusCode).toBe(200);
    const updatedTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['users', 'assets'] });
    expect(updatedTeam.name).toBe('Alpha');
    expect(updatedTeam.role).toBe(ROLE.TESTER);
    expect(updatedTeam.users.length).toBe(2);
    expect(updatedTeam.assets.length).toBe(0);
    const badRequest = new MockExpressRequest({
      body: {
        id: savedTeam.id,
      },
    });
    const badResponse = new MockExpressResponse();
    await updateTeamInfo(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const badRequest2 = new MockExpressRequest({
      body: {
        name: 'Alpha',
        organization: savedOrg.id,
        assetIds: [],
        role: ROLE.TESTER,
      },
    });
    const badResponse2 = new MockExpressResponse();
    await updateTeamInfo(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(400);
    const badRequest3 = new MockExpressRequest({
      body: {
        name: 'Alpha',
        organization: savedOrg.id,
        assetIds: [],
        role: ROLE.TESTER,
        id: 6,
      },
    });
    const badResponse3 = new MockExpressResponse();
    await updateTeamInfo(badRequest3, badResponse3);
    expect(badResponse3.statusCode).toBe(404);
    expect(badResponse2.statusCode).toBe(400);
    const badRequest4 = new MockExpressRequest({
      body: {
        name: 'Alpha',
        organization: savedOrg.id,
        assetIds: [],
        role: 'not a role',
        id: savedTeam.id,
      },
    });
    const badResponse4 = new MockExpressResponse();
    await updateTeamInfo(badRequest4, badResponse4);
    expect(badResponse4.statusCode).toBe(400);
  });

  test('delete team', async () => {
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    // user 1
    const teamMember1 = new User();
    teamMember1.firstName = 'master';
    teamMember1.lastName = 'chief';
    teamMember1.email = 'testing1@jest.com';
    teamMember1.active = true;
    const uuid = uuidv4();
    teamMember1.uuid = uuid;
    teamMember1.password = await generateHash('TangoDown123!!!');
    const addedUser1 = await getConnection()
      .getRepository(User)
      .save(teamMember1);
    // create team
    const bravoTeam = new Team();
    bravoTeam.name = 'Bravo';
    bravoTeam.organization = savedOrg;
    bravoTeam.id = null;
    bravoTeam.createdDate = new Date();
    bravoTeam.lastUpdatedDate = new Date();
    bravoTeam.createdBy = 0;
    bravoTeam.lastUpdatedBy = 0;
    bravoTeam.role = ROLE.READONLY;
    const savedTeam = await getConnection().getRepository(Team).save(bravoTeam);
    const fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['users'] });
    fetchTeam.users.push(addedUser1);
    const savedTeamWithUser = await getConnection()
      .getRepository(Team)
      .save(fetchTeam);
    const userWithTeam = await getConnection()
      .getRepository(User)
      .findOne({ where: { id: addedUser1.id }, relations: ['teams'] });
    expect(userWithTeam.teams.length).toBe(1);
    let teams = await getConnection().getRepository(Team).find({});
    expect(teams.length).toBe(1);
    const request = new MockExpressRequest({
      params: {
        teamId: savedTeamWithUser.id,
      },
    });
    const response = new MockExpressResponse();
    await deleteTeam(request, response);
    expect(response.statusCode).toBe(200);
    teams = await getConnection().getRepository(Team).find({});
    expect(teams.length).toBe(0);
    const userNoTeam = await getConnection()
      .getRepository(User)
      .findOne({ where: { id: addedUser1.id }, relations: ['teams'] });
    expect(userNoTeam.teams.length).toBe(0);
    const badRequest = new MockExpressRequest({
      params: {},
    });
    const badResponse = new MockExpressResponse();
    await deleteTeam(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const badRequest2 = new MockExpressRequest({
      params: {
        teamId: 34,
      },
    });
    const badResponse2 = new MockExpressResponse();
    await deleteTeam(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(404);
  });

  test('get user teams', async () => {
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    const teamMember1 = new User();
    teamMember1.firstName = 'master';
    teamMember1.lastName = 'chief';
    teamMember1.email = 'testing1@jest.com';
    teamMember1.active = true;
    const uuid = uuidv4();
    teamMember1.uuid = uuid;
    teamMember1.password = await generateHash('TangoDown123!!!');
    const addedUser1 = await getConnection()
      .getRepository(User)
      .save(teamMember1);
    // Team 1
    const bravoTeam = new Team();
    bravoTeam.name = 'Bravo';
    bravoTeam.organization = savedOrg;
    bravoTeam.id = null;
    bravoTeam.createdDate = new Date();
    bravoTeam.lastUpdatedDate = new Date();
    bravoTeam.createdBy = 0;
    bravoTeam.lastUpdatedBy = 0;
    bravoTeam.role = ROLE.READONLY;
    const savedTeam = await getConnection().getRepository(Team).save(bravoTeam);
    const fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['users'] });
    fetchTeam.users.push(addedUser1);
    await getConnection().getRepository(Team).save(fetchTeam);
    // Team 2
    const alphaTeam = new Team();
    alphaTeam.name = 'Alpha';
    alphaTeam.organization = savedOrg;
    alphaTeam.id = null;
    alphaTeam.createdDate = new Date();
    alphaTeam.lastUpdatedDate = new Date();
    alphaTeam.createdBy = 0;
    alphaTeam.lastUpdatedBy = 0;
    alphaTeam.role = ROLE.TESTER;
    const savedTeam2 = await getConnection()
      .getRepository(Team)
      .save(alphaTeam);
    const fetchTeam2 = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam2.id }, relations: ['users'] });
    fetchTeam2.users.push(addedUser1);
    await getConnection().getRepository(Team).save(fetchTeam2);
    const request = new MockExpressRequest({
      user: addedUser1.id,
    });
    const response = new MockExpressResponse();
    await getMyTeams(request, response);
    expect(response.statusCode).toBe(200);
    const userTeams: Team[] = response._getJSON();
    expect(userTeams[0].name).toBe(bravoTeam.name);
    expect(userTeams[1].name).toBe(alphaTeam.name);
  });

  test('add asset to team', async () => {
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    const assessments: Assessment[] = [];
    const asset1: Asset = {
      id: null,
      name: 'testAsset1',
      status: status.active,
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset1 = await getConnection().getRepository(Asset).save(asset1);
    const asset2: Asset = {
      id: null,
      name: 'testAsset2',
      status: status.active,
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset2 = await getConnection().getRepository(Asset).save(asset2);
    const asset3: Asset = {
      id: null,
      name: 'testAsset3',
      status: status.active,
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset3 = await getConnection().getRepository(Asset).save(asset3);
    // Team 1
    const team1 = new Team();
    team1.name = 'Bravo';
    team1.organization = savedOrg;
    team1.id = null;
    team1.createdDate = new Date();
    team1.lastUpdatedDate = new Date();
    team1.createdBy = 0;
    team1.lastUpdatedBy = 0;
    team1.role = ROLE.READONLY;
    const savedTeam = await getConnection().getRepository(Team).save(team1);
    const request = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, savedAsset3.id],
        teamId: savedTeam.id,
      },
    });
    const response = new MockExpressResponse();
    await addTeamAsset(request, response);
    expect(response.statusCode).toBe(200);
    const fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['assets'] });
    expect(fetchTeam.assets.length).toBe(3);
    const badRequest = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, savedAsset3.id],
      },
    });
    const badResponse = new MockExpressResponse();
    await addTeamAsset(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const badRequest2 = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, savedAsset3.id],
        teamId: 5,
      },
    });
    const badResponse2 = new MockExpressResponse();
    await addTeamAsset(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(404);
    const badRequest3 = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, 5],
        teamId: savedTeam.id,
      },
    });
    const badResponse3 = new MockExpressResponse();
    await addTeamAsset(badRequest3, badResponse3);
    expect(badResponse3.statusCode).toBe(401);
  });

  test('remove asset from team', async () => {
    // create org
    const newOrg: Organization = {
      id: null,
      name: 'Test Org',
      status: status.active,
      asset: null,
      teams: null,
    };
    const savedOrg = await getConnection()
      .getRepository(Organization)
      .save(newOrg);
    const assessments: Assessment[] = [];
    const asset1: Asset = {
      id: null,
      name: 'testAsset1',
      status: status.active,
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset1 = await getConnection().getRepository(Asset).save(asset1);
    const asset2: Asset = {
      id: null,
      name: 'testAsset2',
      status: status.active,
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset2 = await getConnection().getRepository(Asset).save(asset2);
    const asset3: Asset = {
      id: null,
      name: 'testAsset3',
      status: status.active,
      organization: savedOrg,
      assessment: assessments,
      jira: null,
      teams: null,
    };
    const savedAsset3 = await getConnection().getRepository(Asset).save(asset3);
    // Team 1
    const team1 = new Team();
    team1.name = 'Bravo';
    team1.organization = savedOrg;
    team1.id = null;
    team1.createdDate = new Date();
    team1.lastUpdatedDate = new Date();
    team1.createdBy = 0;
    team1.lastUpdatedBy = 0;
    team1.role = ROLE.READONLY;
    const savedTeam = await getConnection().getRepository(Team).save(team1);
    const fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['assets'] });
    fetchTeam.assets.push(savedAsset1, savedAsset2, savedAsset3);
    await getConnection().getRepository(Team).save(fetchTeam);
    const fetchTeamWithAssets = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['assets'] });
    expect(fetchTeamWithAssets.assets.length).toBe(3);
    const request = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id],
        teamId: savedTeam.id,
      },
    });
    const response = new MockExpressResponse();
    await removeTeamAsset(request, response);
    const fetchTeamWithRemovedAsset = await getConnection()
      .getRepository(Team)
      .findOne({ where: { id: savedTeam.id }, relations: ['assets'] });
    expect(fetchTeamWithRemovedAsset.assets.length).toBe(1);

    const badRequest = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, savedAsset3.id],
      },
    });
    const badResponse = new MockExpressResponse();
    await removeTeamAsset(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const badRequest2 = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, savedAsset3.id],
        teamId: 5,
      },
    });
    const badResponse2 = new MockExpressResponse();
    await removeTeamAsset(badRequest2, badResponse2);
    expect(badResponse2.statusCode).toBe(404);
    const badRequest3 = new MockExpressRequest({
      body: {
        assetIds: [savedAsset1.id, savedAsset2.id, 5],
        teamId: savedTeam.id,
      },
    });
    const badResponse3 = new MockExpressResponse();
    await removeTeamAsset(badRequest3, badResponse3);
    expect(badResponse3.statusCode).toBe(401);
  });

  test('get all teams', async () => {
    const request = new MockExpressRequest({});
    const response = new MockExpressResponse();
    await getAllTeams(request, response);
    const fetchedTeams: Team[] = response._getJSON();
    expect(fetchedTeams.length).toBe(0);
  });
});
