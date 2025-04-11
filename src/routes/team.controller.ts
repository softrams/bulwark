import { getRepository, In } from 'typeorm';
import { Team } from '../entity/Team';
import { User } from '../entity/User';
import { Response, Request } from 'express';
import { validate } from 'class-validator';
import { UserRequest } from '../interfaces/user-request.interface';
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import { ROLE } from '../enums/roles-enum';
import { AppDataSource } from '../data-source';

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository
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
  } catch (error) {
    console.error('Error getting all teams:', error);
    return res.status(500).json('An error occurred while fetching teams');
  }
};

export const fetchAssets = async (assetIds: number[]) => {
  try {
    const assetRepository = AppDataSource.getRepository(Asset);
    const assets = await assetRepository.find({
      where: { id: In(assetIds) }
    });
    
    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
};

export const fetchUsers = async (userIds: number[]) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      where: { 
        id: In(userIds),
        active: true 
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUsersAndUpdateTeam = async (
  userIds: number[],
  teamUsers: User[]
) => {
  try {
    if (!userIds) {
      return [];
    } else {
      const newUsers = await fetchUsers(userIds);
      return newUsers;
    }
  } catch (error) {
    console.error('Error updating team users:', error);
    return teamUsers || [];
  }
};

export const fetchAssetsAndUpdateTeam = async (
  assetIds: number[],
  teamAssets: Asset[]
) => {
  try {
    const newAssets = await fetchAssets(assetIds);
    return newAssets;
  } catch (error) {
    console.error('Error updating team assets:', error);
    return teamAssets || [];
  }
};

export const getTeamById = async (req: UserRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    
    if (isNaN(+teamId)) {
      return res.status(400).json('Invalid Team ID');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const fetchedTeam = await teamRepository
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
  } catch (error) {
    console.error('Error getting team by ID:', error);
    return res.status(500).json('An error occurred while fetching the team');
  }
};

export const createTeam = async (req: UserRequest, res: Response) => {
  try {
    const { name, organization, role, assetIds, users } = req.body;
    const newTeam = new Team();
    let fetchedOrg: Organization;
    
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    if (role !== ROLE.ADMIN) {
      fetchedOrg = await organizationRepository.findOne({
        where: { id: organization },
        relations: ['teams']
      });
      
      if (!fetchedOrg) {
        return res.status(404).json('Organization not found');
      }
    } else {
      fetchedOrg = null;
    }
    
    newTeam.id = null;
    newTeam.name = name;
    newTeam.organization = fetchedOrg;
    newTeam.role = role;
    newTeam.createdBy = +req.user;
    newTeam.createdDate = new Date();
    newTeam.lastUpdatedBy = +req.user;
    newTeam.lastUpdatedDate = new Date();
    
    if (users && users.length) {
      newTeam.users = await fetchUsers(users);
    }
    
    if (assetIds && assetIds.length) {
      newTeam.assets = await fetchAssets(assetIds);
    }
    
    const errors = await validate(newTeam);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json('Submitted Team is Invalid');
    } else {
      const teamRepository = AppDataSource.getRepository(Team);
      await teamRepository.save(newTeam);
      return res.status(200).json('The team has been successfully created');
    }
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json('An error occurred while creating the team');
  }
};

export const addTeamMember = async (req: UserRequest, res: Response) => {
  try {
    const { userIds, teamId } = req.body;
    
    // Verify team exists
    if (!teamId) {
      return res.status(400).json('Invalid Team ID');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const team = await teamRepository.findOne({
      where: { id: teamId },
      relations: ['users']
    });
    
    if (!team) {
      return res.status(404).json(`A Team with ID ${teamId} does not exist`);
    }
    
    // Verify each user ID links to a valid user
    team.users = await fetchUsers(userIds);
    
    // Save the team once valid users have been pushed to team
    await teamRepository.save(team);
    return res.status(200).json('Team membership has been successfully updated');
  } catch (error) {
    console.error('Error adding team member:', error);
    return res.status(500).json('An error occurred while adding team members');
  }
};

export const removeTeamMember = async (req: UserRequest, res: Response) => {
  try {
    const userIds = req.body.userIds;
    const teamId = req.body.teamId;
    
    // Verify team exists
    if (!teamId) {
      return res.status(400).json('Invalid Team ID');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const userRepository = AppDataSource.getRepository(User);
    
    const team = await teamRepository.findOne({
      where: { id: teamId },
      relations: ['users']
    });
    
    if (!team) {
      return res.status(404).json(`A Team with ID ${teamId} does not exist`);
    }
    
    // Verify each user ID links to a valid user
    for (const userId of userIds) {
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        return res.status(404).json(`A User with ID ${userId} does not exist`);
      } else {
        team.users = team.users.filter((userIdx) => userIdx.id !== user.id);
      }
    }
    
    // Save the team once valid users have been pushed to team
    await teamRepository.save(team);
    return res.status(200).json('Team membership has been successfully updated');
  } catch (error) {
    console.error('Error removing team member:', error);
    return res.status(500).json('An error occurred while removing team members');
  }
};

export const updateTeamInfo = async (req: Request, res: Response) => {
  try {
    const { name, role, id, users } = req.body;
    let organization: Organization = req.body.organization;
    let assetIds: number[] = req.body.assetIds;
    
    if (!(name || organization || role)) {
      return res.status(400).json('Team is invalid');
    }
    
    if (!id) {
      return res.status(400).json('The Team ID is invalid');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    const team = await teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.users', 'users')
      .leftJoinAndSelect('team.assets', 'assets')
      .leftJoinAndSelect('team.organization', 'organization')
      .leftJoinAndSelect('organization.asset', 'orgAssets')
      .where('team.id = :teamId', { teamId: id })
      .select(['team', 'users', 'assets', 'organization', 'orgAssets'])
      .getOne();
      
    if (!team) {
      return res.status(404).json(`A Team with ID ${id} does not exist`);
    }
    
    // If the incoming organization has changed
    // Remove all previous asset associations
    if (role !== ROLE.ADMIN) {
      organization = await organizationRepository.findOne({
        where: { id: +organization },
        relations: ['teams']
      });
      
      if (!organization) {
        return res.status(404).json('Organization not found');
      }
      
      if (team.organization && organization && +organization.id !== +team.organization.id) {
        for (const orgAsset of team.organization.asset) {
          assetIds = assetIds.filter((x) => x !== orgAsset.id);
        }
      }
    } else {
      organization = null;
    }
    
    team.users = await fetchUsersAndUpdateTeam(users, team.users);
    team.assets = await fetchAssetsAndUpdateTeam(assetIds, team.assets);
    team.name = name;
    team.organization = organization;
    team.role = role;
    
    const errors = await validate(team);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json('Submitted Team is Invalid');
    } else {
      await teamRepository.save(team);
      return res.status(200).json('Team has been patched successfully');
    }
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json('An error occurred while updating the team');
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    if (!teamId) {
      return res.status(400).json('Invalid Team ID');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const team = await teamRepository.findOne({ where: { id: +teamId } });
    
    if (!team) {
      return res.status(404).json(`A Team with ID ${teamId} does not exist`);
    }
    
    await teamRepository.remove(team);
    return res
      .status(200)
      .json(`The Team ${team.name} has been successfully deleted`);
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json('An error occurred while deleting the team');
  }
};

export const getMyTeams = async (req: UserRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: +req.user },
      relations: ['teams']
    });
    
    if (!user) {
      return res.status(404).json('User not found');
    }
    
    return res.status(200).json(user.teams);
  } catch (error) {
    console.error('Error getting my teams:', error);
    return res.status(500).json('An error occurred while fetching your teams');
  }
};

export const addTeamAsset = async (req: Request, res: Response) => {
  try {
    const { assetIds, teamId } = req.body;
    
    if (!teamId) {
      return res.status(400).json('Invalid Team ID');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const assetRepository = AppDataSource.getRepository(Asset);
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    const team = await teamRepository.findOne({
      where: { id: teamId },
      relations: ['assets', 'organization']
    });
    
    if (!team) {
      return res.status(404).json(`A Team with ID ${teamId} does not exist`);
    }
    
    const org = await organizationRepository.findOne({
      where: { id: team.organization.id },
      relations: ['asset']
    });
    
    const orgAssets = org.asset.map((asset) => asset.id);
    
    // Verify each asset ID links to a valid asset
    for (const assetId of assetIds) {
      // Verify we are only associating assets of that organization
      if (!orgAssets.includes(assetId)) {
        return res
          .status(401)
          .json(`The Asset with ID ${assetId} is unauthorized`);
      }
      
      const asset = await assetRepository.findOne({ where: { id: assetId } });
      
      if (!asset) {
        return res.status(404).json(`Asset with ID ${assetId} not found`);
      }
      
      team.assets.push(asset);
    }
    
    // Save the team once valid assets have been pushed to team
    await teamRepository.save(team);
    return res.status(200).json('Team Assets has been successfully updated');
  } catch (error) {
    console.error('Error adding team asset:', error);
    return res.status(500).json('An error occurred while adding team assets');
  }
};

export const removeTeamAsset = async (req: Request, res: Response) => {
  try {
    const { assetIds, teamId } = req.body;
    
    if (!teamId) {
      return res.status(400).json('Invalid Team ID');
    }
    
    const teamRepository = AppDataSource.getRepository(Team);
    const assetRepository = AppDataSource.getRepository(Asset);
    const organizationRepository = AppDataSource.getRepository(Organization);
    
    const team = await teamRepository.findOne({
      where: { id: teamId },
      relations: ['assets', 'organization']
    });
    
    if (!team) {
      return res.status(404).json(`A Team with ID ${teamId} does not exist`);
    }
    
    const org = await organizationRepository.findOne({
      where: { id: team.organization.id },
      relations: ['asset']
    });
    
    const orgAssets = org.asset.map((asset) => asset.id);
    
    // Verify each asset ID links to a valid asset
    for (const assetId of assetIds) {
      // Verify we are only associating assets of that organization
      if (!orgAssets.includes(assetId)) {
        return res
          .status(401)
          .json(`The Asset with ID ${assetId} is unauthorized`);
      }
      
      const asset = await assetRepository.findOne({ where: { id: assetId } });
      
      if (!asset) {
        return res.status(404).json(`Asset with ID ${assetId} not found`);
      }
      
      team.assets = team.assets.filter((assetIdx) => assetIdx.id !== asset.id);
    }
    
    // Save the team once assets have been removed
    await teamRepository.save(team);
    return res.status(200).json('Team Assets has been successfully updated');
  } catch (error) {
    console.error('Error removing team asset:', error);
    return res.status(500).json('An error occurred while removing team assets');
  }
};