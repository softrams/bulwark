import { getConnection, getRepository, In } from 'typeorm';
import { Team } from '../entity/Team';
import { User } from '../entity/User';
import { Response, Request } from 'express';
import { validate } from 'class-validator';
import { UserRequest } from '../interfaces/user-request.interface';
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';

export const getAllTeams = async (req: Request, res: Response) => {
  const teams = await getConnection().getRepository(Team).find({});
  return res.status(200).json(teams);
};

export const createTeam = async (req: UserRequest, res: Response) => {
  const { name, organization, asset, role } = req.body;
  const fetchedOrg = await getConnection()
    .getRepository(Organization)
    .findOne(organization, { relations: ['teams'] });
  if (!fetchedOrg) {
    return res.status(404).json('Organization not found');
  }
  const teamUsers: User[] = [];
  const newTeam = new Team();
  newTeam.id = null;
  newTeam.name = name;
  newTeam.organization = fetchedOrg;
  newTeam.asset = asset;
  newTeam.role = role;
  newTeam.createdBy = +req.user;
  newTeam.createdDate = new Date();
  newTeam.lastUpdatedBy = +req.user;
  newTeam.lastUpdatedDate = new Date();
  newTeam.users = teamUsers;
  const errors = await validate(newTeam);
  if (errors.length > 0) {
    return res.status(400).json('Submitted Team is Invalid');
  } else {
    await getConnection().getRepository(Team).save(newTeam);
    return res.status(200).json('The team has been successfully created');
  }
};

export const addTeamMember = async (req: UserRequest, res: Response) => {
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
      team.users.push(user);
    }
  }
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
  const { name, organization, asset, role, teamId } = req.body;
  if (!(name || organization || asset || role)) {
    return res.status(400).json('Team is invalid');
  }
  if (!teamId) {
    return res.status(400).json('The Team ID is invalid');
  }
  const team = await getConnection().getRepository(Team).findOne(teamId);
  if (!team) {
    return res.status(404).json(`A Team with ID ${teamId} does not exist`);
  }
  // Update with parameters passed in
  team.name = name;
  team.organization = organization;
  team.asset = asset;
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
  const { teamId } = req.body;
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
