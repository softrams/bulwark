import { Response, Request } from 'express';
import { Config } from '../entity/Config';
import { User } from '../entity/User';
import { Team } from '../entity/Team';
import { encrypt } from '../utilities/crypto.utility';
import { validate } from 'class-validator';
import { generateHash } from '../utilities/password.utility';
import { ROLE } from '../enums/roles-enum';
import { AppDataSource } from '../data-source';

export const initialInsert = async () => {
  try {
    const configRepository = AppDataSource.getRepository(Config);
    const userRepository = AppDataSource.getRepository(User);
    const teamRepository = AppDataSource.getRepository(Team);
    
    const configAry = await configRepository.find();
    const usrAry = await userRepository.find();
    let savedUser: User;
    const defaultTeamAry = await teamRepository.find();
    
    // Create initial configuration if it doesn't exist
    if (!configAry.length) {
      const initialConfig = new Config();
      initialConfig.companyName = null;
      initialConfig.fromEmail = null;
      initialConfig.fromEmailPassword = null;
      await configRepository.save(initialConfig);
    }
    
    // Create initial admin user if no users exist
    if (!usrAry.length) {
      const initialUser = new User();
      initialUser.active = true;
      initialUser.email = 'admin@example.com';
      initialUser.firstName = 'Master';
      initialUser.lastName = 'Chief';
      initialUser.title = 'Spartan 117';
      initialUser.password = await generateHash('changeMe');
      savedUser = await userRepository.save(initialUser);
    }
    
    // Create default admin team if no teams exist
    if (!defaultTeamAry.length) {
      const defaultAdminTeam = new Team();
      defaultAdminTeam.name = 'Administrators';
      defaultAdminTeam.createdDate = new Date();
      defaultAdminTeam.lastUpdatedDate = new Date();
      defaultAdminTeam.createdBy = savedUser ? savedUser.id : null;
      defaultAdminTeam.lastUpdatedBy = savedUser ? savedUser.id : null;
      defaultAdminTeam.organization = null;
      defaultAdminTeam.role = ROLE.ADMIN;
      
      if (savedUser) {
        defaultAdminTeam.users = [savedUser];
      }
      
      await teamRepository.save(defaultAdminTeam);
    }
  } catch (error) {
    console.error('Error during initial setup:', error);
  }
};

export const getConfig = async (req: Request, res: Response) => {
  try {
    const configRepository = AppDataSource.getRepository(Config);
    const existingConfig = await configRepository.findOne({ where: { id: 1 } });
    
    if (!existingConfig) {
      return res.status(404).json('Configuration not found');
    }
    
    // Don't return the password in the response
    const configResponse = { ...existingConfig };
    delete configResponse.fromEmailPassword;
    
    return res.status(200).json(configResponse);
  } catch (error) {
    console.error('Error getting configuration:', error);
    return res.status(500).json('An error occurred while fetching the configuration');
  }
};

export const saveConfig = async (req: Request, res: Response) => {
  try {
    const configRepository = AppDataSource.getRepository(Config);
    
    const fromEmail = req.body.fromEmail;
    const fromEmailPassword = req.body.fromEmailPassword;
    const companyName = req.body.companyName;
    
    const existingConfig = await configRepository.findOne({ where: { id: 1 } });
    
    if (!existingConfig) {
      return res.status(404).json('Configuration not found');
    }
    
    existingConfig.companyName = companyName;
    existingConfig.fromEmail = fromEmail;
    
    if (fromEmailPassword) {
      const encryptedPassword = encrypt(fromEmailPassword);
      existingConfig.fromEmailPassword = encryptedPassword;
    }
    
    const errors = await validate(existingConfig, {
      skipMissingProperties: true,
    });
    
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json('Settings validation failed');
    }
    
    await configRepository.save(existingConfig);
    return res.status(200).json('Settings updated successfully');
  } catch (error) {
    console.error('Error saving configuration:', error);
    return res.status(500).json('An error occurred while saving the configuration');
  }
};