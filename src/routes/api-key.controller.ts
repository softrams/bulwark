import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { UserRequest } from '../interfaces/user-request.interface';
import { ApiKey } from '../entity/ApiKey';
import * as crypto from 'crypto';
import { validate } from 'class-validator';
import { Response } from 'express';
import { generateHash } from '../utilities/password.utility';

/**
 * @description Generates an active API key. Deactivates deprecated keys
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message with API key
 */
export const generateApiKey = async (req: UserRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    
    const user = await userRepository.findOne({ where: { id: +req.user } });
    
    if (!user) {
      return res.status(404).json('User not found');
    }
    
    const buf = crypto.randomBytes(24);
    const secretBuf = crypto.randomBytes(24);
    const secretKey = await generateHash(secretBuf.toString('hex'));
    
    const apiKey: ApiKey = new ApiKey();
    apiKey.key = buf.toString('hex');
    apiKey.secretKey = secretKey;
    apiKey.createdDate = new Date();
    apiKey.lastUpdatedDate = new Date();
    apiKey.lastUpdatedBy = +req.user;
    apiKey.active = true;
    apiKey.user = user;
    
    await deactivateExistingApiKeys(user);
    const savedApiKey = await apiKeyRepository.save(apiKey);
    
    return res.status(200).json(
      `Write down the following keys and keep it in a safe place. You will not be able to retrieve the keys at a later time. 
      
      Bulwark-Api-Key: ${savedApiKey.key}
      Bulwark-Secret-Key: ${secretBuf.toString('hex')}`
    );
  } catch (error) {
    console.error('Error generating API key:', error);
    return res.status(500).json('An error occurred while generating the API key');
  }
};

/**
 * @description Deactivates all deprecated keys
 * @param {User} user
 * @returns n/a
 */
const deactivateExistingApiKeys = async (user: User) => {
  try {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    
    const activeApiKeys = await apiKeyRepository.find({
      where: { 
        user: { id: user.id },
        active: true 
      }
    });
    
    if (activeApiKeys && activeApiKeys.length) {
      for (const activeApiKey of activeApiKeys) {
        activeApiKey.active = false;
        activeApiKey.lastUpdatedDate = new Date();
        activeApiKey.lastUpdatedBy = user.id;
        await apiKeyRepository.save(activeApiKey);
      }
    }
  } catch (error) {
    console.error('Error deactivating existing API keys:', error);
  }
};

/**
 * @description Soft deletes API key from user profile menu
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const deleteApiKeyAsUser = async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json('Invalid API key');
    }
    
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    
    const apiKey = await apiKeyRepository
      .createQueryBuilder('apiKey')
      .leftJoinAndSelect('apiKey.user', 'user')
      .where('apiKey.id = :id', { id })
      .andWhere('user.id = :userId', { userId: +req.user })
      .getOne();
    
    if (!apiKey) {
      return res.status(404).json('API key not found');
    }
    
    apiKey.active = false;
    apiKey.lastUpdatedBy = +req.user;
    apiKey.lastUpdatedDate = new Date();
    
    await apiKeyRepository.save(apiKey);
    return res.status(200).json('The API key has been deleted');
  } catch (error) {
    console.error('Error deleting API key as user:', error);
    return res.status(500).json('An error occurred while deleting the API key');
  }
};

/**
 * @description Soft deletes API key from Admin menu
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const deleteApiKeyAsAdmin = async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json('Invalid API key');
    }
    
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    const apiKey = await apiKeyRepository.findOne({ where: { id: parseInt(id) } });
    
    if (!apiKey) {
      return res.status(404).json('API key not found');
    }
    
    apiKey.active = false;
    apiKey.lastUpdatedDate = new Date();
    apiKey.lastUpdatedBy = +req.user;
    
    await apiKeyRepository.save(apiKey);
    return res.status(200).json('The API key has been deactivated');
  } catch (error) {
    console.error('Error deleting API key as admin:', error);
    return res.status(500).json('An error occurred while deleting the API key');
  }
};

/**
 * @description Retrieves Active API key metadata for user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns API key information
 */
export const getUserApiKeyInfo = async (req: UserRequest, res: Response) => {
  try {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    
    const apiKeyInfo = await apiKeyRepository
      .createQueryBuilder('apiKey')
      .leftJoinAndSelect('apiKey.user', 'user')
      .where('apiKey.active = true')
      .andWhere('user.id = :userId', { userId: +req.user })
      .select(['apiKey.createdDate', 'apiKey.lastUpdatedDate', 'apiKey.id'])
      .getOne();
    
    if (!apiKeyInfo) {
      return res.status(200).json(null);
    }
    
    return res.status(200).json(apiKeyInfo);
  } catch (error) {
    console.error('Error getting user API key info:', error);
    return res.status(500).json('An error occurred while retrieving API key information');
  }
};

/**
 * @description Retrieves API key metadata for admin
 * @param {UserRequest} req
 * @param {Response} res
 * @returns API key information
 */
export const getAdminApiKeyInfo = async (req: UserRequest, res: Response) => {
  try {
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);
    
    const apiKeyInfo = await apiKeyRepository
      .createQueryBuilder('apiKey')
      .leftJoinAndSelect('apiKey.user', 'user')
      .where('apiKey.active = true')
      .select([
        'apiKey.id',
        'apiKey.createdDate',
        'apiKey.lastUpdatedDate',
        'user.email',
      ])
      .getMany();
    
    return res.status(200).json(apiKeyInfo);
  } catch (error) {
    console.error('Error getting admin API key info:', error);
    return res.status(500).json('An error occurred while retrieving API key information');
  }
};