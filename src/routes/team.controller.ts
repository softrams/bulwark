import { getConnection, getRepository, In } from 'typeorm';
import { Team } from '../entity/Team';
import { User } from '../entity/User';
import { Response, Request } from 'express';
import { validate } from 'class-validator';
import { UserRequest } from '../interfaces/user-request.interface';

export const getAllTeams = async (req: Request, res: Response) => {
  const teams = await getConnection().getRepository(Team).find({});
  return res.status(200).json(teams);
};

export const createTeam = async (req: UserRequest, res: Response) => {
  const { name, organization, asset, role } = req.body;
  const teamUsers: User[] = [];
  const newTeam = new Team();
  newTeam.id = null;
  newTeam.name = name;
  newTeam.organization = organization;
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

export const fetchTeamMembers = async (teamUserIds: number[]) => {
  const users = await getConnection()
    .getRepository(User)
    .find({ where: { id: In(teamUserIds) } });
  return users;
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

export const deleteTeam = (req: Request, res: Response) => {
  //
};

export const getMyTeams = (req: Request, res: Response) => {};
