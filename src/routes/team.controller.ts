import { getConnection, getRepository, In } from 'typeorm';
import { Team } from '../entity/Team';
import { User } from '../entity/User';
import { Response, Request } from 'express';
import { validate } from 'class-validator';
import { UserRequest } from '../interfaces/user-request.interface';
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';

export const getAllTeams = async (req: Request, res: Response) => {
  // TODO: Remove user passwords
  const teams = await getConnection()
    .getRepository(Team)
    .createQueryBuilder('team')
    .leftJoinAndSelect('team.users', 'users')
    .leftJoinAndSelect('team.assets', 'assets')
    .leftJoinAndSelect('team.organization', 'organization')
    .select([
      'team',
      'assets',
      'organization',
      'users.firstName',
      'users.lastName',
      'users.title',
      'users.id',
    ])
    .getMany();
  return res.status(200).json(teams);
};

export const fetchAssets = async (assetIds: number[]) => {
  const assetAry: Asset[] = [];
  for (const assetId of assetIds) {
    const asset = await getConnection().getRepository(Asset).findOne(assetId);
    if (asset) {
      assetAry.push(asset);
    }
  }
  return assetAry;
};

export const fetchUsers = async (userIds: number[]) => {
  const userAry: User[] = [];
  for (const userId of userIds) {
    const user = await getConnection()
      .getRepository(User)
      .findOne(userId, { where: { active: true } });
    if (user) {
      userAry.push(user);
    }
  }
  return userAry;
};

export const fetchUsersAndUpdateTeam = async (
  userIds: number[],
  teamUsers: User[]
) => {
  if (!userIds) {
    teamUsers = [];
    return teamUsers;
  } else {
    const newUsers = await fetchUsers(userIds);
    teamUsers = newUsers;
    return teamUsers;
  }
};

export const fetchAssetsAndUpdateTeam = async (
  assetIds: number[],
  teamAssets: Asset[]
) => {
  if (!assetIds) {
    teamAssets = [];
    return teamAssets;
  } else {
    const newAssets = await fetchAssets(assetIds);
    teamAssets = newAssets;
    return teamAssets;
  }
};

export const getTeamById = async (req: UserRequest, res: Response) => {
  const { teamId } = req.params;
  if (isNaN(+teamId)) {
    return res.status(400).json('Invalid Team ID');
  }
  const fetchedTeam = await getConnection()
    .getRepository(Team)
    .createQueryBuilder('team')
    .leftJoinAndSelect('team.users', 'users')
    .leftJoinAndSelect('team.assets', 'assets')
    .leftJoinAndSelect('assets.jira', 'jira')
    .leftJoinAndSelect('team.organization', 'organization')
    .where('team.id = :teamId', { teamId })
    .select([
      'team',
      'assets',
      'jira.id',
      'organization',
      'users.firstName',
      'users.lastName',
      'users.title',
      'users.id',
    ])
    .getOne();
  if (!fetchedTeam) {
    return res.status(404).json('Team not found');
  } else {
    return res.status(200).json(fetchedTeam);
  }
};

export const createTeam = async (req: UserRequest, res: Response) => {
  const { name, organization, role, assetIds, users } = req.body;
  const newTeam = new Team();
  const fetchedOrg = await getConnection()
    .getRepository(Organization)
    .findOne(organization, { relations: ['teams'] });
  if (!fetchedOrg) {
    return res.status(404).json('Organization not found');
  }
  newTeam.id = null;
  newTeam.name = name;
  newTeam.organization = fetchedOrg;
  newTeam.role = role;
  newTeam.createdBy = +req.user;
  newTeam.createdDate = new Date();
  newTeam.lastUpdatedBy = +req.user;
  newTeam.lastUpdatedDate = new Date();
  if (users && users.length) newTeam.users = await fetchUsers(users);
  if (assetIds && assetIds.length) newTeam.assets = await fetchAssets(assetIds);
  const errors = await validate(newTeam);
  if (errors.length > 0) {
    return res.status(400).json('Submitted Team is Invalid');
  } else {
    await getConnection().getRepository(Team).save(newTeam);
    return res.status(200).json('The team has been successfully created');
  }
};

export const addTeamMember = async (req: UserRequest, res: Response) => {
  const { userIds, teamId } = req.body;
  // Verify team exists
  if (!teamId) {
    return res.status(400).json('Invalid Team ID');
  }
  const team = await getConnection()
    .getRepository(Team)
    .findOne(teamId, { relations: ['users'] });
  if (!team) {
    return res.status(404).json(`A Team with ID ${teamId} does not exist`);
  }
  // Verify each user ID links to a valid user
  team.users = await fetchUsers(userIds);
  // Save the team once valid users have been pushed to team
  await getConnection().getRepository(Team).save(team);
  return res.status(200).json('Team membership has been successfully updated');
};

export const removeTeamMember = async (req: UserRequest, res: Response) => {
  const userIds = req.body.userIds;
  const teamId = req.body.teamId;
  // Verify team exists
  if (!teamId) {
    return res.status(400).json('Invalid Team ID');
  }
  const team = await getConnection()
    .getRepository(Team)
    .findOne(teamId, { relations: ['users'] });
  if (!team) {
    return res.status(404).json(`A Team with ID ${teamId} does not exist`);
  }
  // Verify each user ID links to a valid user
  for (const userId of userIds) {
    const user = await getConnection().getRepository(User).findOne(userId);
    if (!user) {
      return res.status(404).json(`A User with ID ${userId} does not exist`);
    } else {
      team.users = team.users.filter((userIdx) => userIdx.id !== user.id);
    }
  }
  // Save the team once valid users have been pushed to team
  await getConnection().getRepository(Team).save(team);
  return res.status(200).json('Team membership has been successfully updated');
};

export const updateTeamInfo = async (req: Request, res: Response) => {
  const { name, organization, role, id, assetIds, users } = req.body;
  if (!(name || organization || role)) {
    return res.status(400).json('Team is invalid');
  }
  if (!id) {
    return res.status(400).json('The Team ID is invalid');
  }
  const team = await getConnection()
    .getRepository(Team)
    .findOne(id, { relations: ['users', 'assets'] });
  if (!team) {
    return res.status(404).json(`A Team with ID ${id} does not exist`);
  }
  team.users = await fetchUsersAndUpdateTeam(users, team.users);
  team.assets = await fetchAssetsAndUpdateTeam(assetIds, team.assets);
  team.name = name;
  team.organization = organization;
  team.role = role;
  const errors = await validate(team);
  if (errors.length > 0) {
    return res.status(400).json('Submitted Team is Invalid');
  } else {
    await getConnection().getRepository(Team).save(team);
    return res.status(200).json('Team has been patched successfully');
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  if (!teamId) {
    return res.status(400).json('Invalid Team ID');
  }
  const team = await getConnection().getRepository(Team).findOne(teamId);
  if (!team) {
    return res.status(404).json(`A Team with ID ${teamId} does not exist`);
  }
  await getConnection().getRepository(Team).delete(team.id);
  return res
    .status(200)
    .json(`The Team ${team.name} has been successfully deleted`);
};

export const getMyTeams = async (req: UserRequest, res: Response) => {
  const user = await getConnection()
    .getRepository(User)
    .findOne(req.user, { relations: ['teams'] });
  return res.status(200).json(user.teams);
};

export const addTeamAsset = async (req: Request, res: Response) => {
  const { assetIds, teamId } = req.body;
  if (!teamId) {
    return res.status(400).json('Invalid Team ID');
  }
  const team = await getConnection()
    .getRepository(Team)
    .findOne(teamId, { relations: ['assets', 'organization'] });
  if (!team) {
    return res.status(404).json(`A Team with ID ${teamId} does not exist`);
  }
  const org = await getConnection()
    .getRepository(Organization)
    .findOne(team.organization.id, { relations: ['asset'] });
  const orgAssets = org.asset.map((asset) => asset.id);
  // Verify each asset ID links to a valid user
  for (const assetId of assetIds) {
    // Verify we are only associating assets of that organization
    if (!orgAssets.includes(assetId)) {
      return res
        .status(401)
        .json(`The Asset with ID ${assetId} is unauthorized`);
    }
    const asset = await getConnection().getRepository(Asset).findOne(assetId);
    team.assets.push(asset);
  }
  // Save the team once valid assets have been pushed to team
  await getConnection().getRepository(Team).save(team);
  return res.status(200).json('Team Assets has been successfully updated');
};

export const removeTeamAsset = async (req: Request, res: Response) => {
  const { assetIds, teamId } = req.body;
  if (!teamId) {
    return res.status(400).json('Invalid Team ID');
  }
  const team = await getConnection()
    .getRepository(Team)
    .findOne(teamId, { relations: ['assets', 'organization'] });
  if (!team) {
    return res.status(404).json(`A Team with ID ${teamId} does not exist`);
  }
  const org = await getConnection()
    .getRepository(Organization)
    .findOne(team.organization.id, { relations: ['asset'] });
  const orgAssets = org.asset.map((asset) => asset.id);
  // Verify each asset ID links to a valid user
  for (const assetId of assetIds) {
    // Verify we are only associating assets of that organization
    if (!orgAssets.includes(assetId)) {
      return res
        .status(401)
        .json(`The Asset with ID ${assetId} is unauthorized`);
    }
    const asset = await getConnection().getRepository(Asset).findOne(assetId);
    team.assets = team.assets.filter((assetIdx) => assetIdx.id !== asset.id);
  }
  // Save the team once valid assets have been pushed to team
  await getConnection().getRepository(Team).save(team);
  return res.status(200).json('Team Assets has been successfully updated');
};
