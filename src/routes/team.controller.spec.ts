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
import {
  createTeam,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
  updateTeamInfo,
  getMyTeams,
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
    const request = new MockExpressRequest({
      body: {
        id: null,
        name: 'Test Team',
        organization: savedOrg.id,
        asset: null,
        role: ROLE.ADMIN,
      },
      user: savedUser.id,
    });
    const response = new MockExpressResponse();
    await createTeam(request, response);
    expect(response.statusCode).toBe(200);
    const teams = await getConnection()
      .getRepository(Team)
      .find({ relations: ['users'] });
    expect(teams.length).toBe(1);
    expect(teams[0].users.length).toBe(0);
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
    const badRequest = new MockExpressRequest({
      body: {
        userIds: [1, 2, 6],
        teamId: savedTeam.id,
      },
    });
    const badResponse = new MockExpressResponse();
    await addTeamMember(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(404);
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
      .findOne(savedTeam.id, { relations: ['users'] });
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
      .findOne(savedTeam.id, { relations: ['users'] });
    expect(fetchTeam.users.length).toBe(0);
    fetchTeam.users.push(addedUser1, addedUser2, addedUser3);
    fetchTeam = await getConnection().getRepository(Team).save(fetchTeam);
    fetchTeam = await getConnection()
      .getRepository(Team)
      .findOne(fetchTeam.id, { relations: ['users'] });
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
      .findOne(fetchTeam.id, { relations: ['users'] });
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
        name: 'Alpha',
        organization: savedOrg.id,
        asset: null,
        role: ROLE.TESTER,
        teamId: savedTeam.id,
      },
    });
    const response = new MockExpressResponse();
    await updateTeamInfo(request, response);
    expect(response.statusCode).toBe(200);
    const updatedTeam = await getConnection()
      .getRepository(Team)
      .findOne(savedTeam.id);
    expect(updatedTeam.name).toBe('Alpha');
    expect(updatedTeam.role).toBe(ROLE.TESTER);
    const badRequest = new MockExpressRequest({
      body: {
        teamId: savedTeam.id,
      },
    });
    const badResponse = new MockExpressResponse();
    await updateTeamInfo(badRequest, badResponse);
    expect(badResponse.statusCode).toBe(400);
    const badRequest2 = new MockExpressRequest({
      body: {
        name: 'Alpha',
        organization: savedOrg.id,
        asset: null,
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
        asset: null,
        role: ROLE.TESTER,
        teamId: 6,
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
        asset: null,
        role: 'not a role',
        teamId: savedTeam.id,
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
      .findOne(savedTeam.id, { relations: ['users'] });
    fetchTeam.users.push(addedUser1);
    const savedTeamWithUser = await getConnection()
      .getRepository(Team)
      .save(fetchTeam);
    const userWithTeam = await getConnection()
      .getRepository(User)
      .findOne(addedUser1.id, { relations: ['teams'] });
    expect(userWithTeam.teams.length).toBe(1);
    let teams = await getConnection().getRepository(Team).find({});
    expect(teams.length).toBe(1);
    const request = new MockExpressRequest({
      body: {
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
      .findOne(addedUser1.id, { relations: ['teams'] });
    expect(userNoTeam.teams.length).toBe(0);
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
      .findOne(savedTeam.id, { relations: ['users'] });
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
      .findOne(savedTeam2.id, { relations: ['users'] });
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
});
