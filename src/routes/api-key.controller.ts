import { User } from '../entity/User';
import { getConnection } from 'typeorm';
import { UserRequest } from '../interfaces/user-request.interface';
import { ApiKey } from '../entity/ApiKey';
const crypto = require('crypto');
import { validate } from 'class-validator';
import { Response } from 'express';
import { generateHash } from '../utilities/password.utility';

/**
 * @description Generates an active API key.  Deactivates deprecated keys
 * @param {UserRequest} req
 * @param {Response} res c
 * @returns success message with API key
 */
export const generateApiKey = async (req: UserRequest, res: Response) => {
  const user = await getConnection().getRepository(User).findOne({ where: { id: +req.user } });
  const buf = crypto.randomBytes(24);
  const secretBuf = crypto.randomBytes(24);
  const secretKey = await generateHash(secretBuf.toString('hex'));
  const apiKey: ApiKey = {
    id: null,
    key: buf.toString('hex'),
    secretKey,
    createdDate: new Date(),
    lastUpdatedDate: new Date(),
    lastUpdatedBy: +req.user,
    active: true,
    user,
  };
  await deactivateExistingApiKeys(user);
  const savedApiKey = await getConnection().getRepository(ApiKey).save(apiKey);
  return res.status(200).json(
    `Write down the following keys and keep it in a safe place. You will not be able to retrieve the keys at a later time. 
      
      Bulwark-Api-Key: ${savedApiKey.key}
      Bulwark-Secret-Key: ${secretBuf.toString('hex')}`
  );
};

/**
 * @description Deactivates all deprecated keys
 * @param {User} user
 * @returns n/a
 */
const deactivateExistingApiKeys = async (user: User) => {
  const activeApiKeys = await getConnection()
    .getRepository(ApiKey)
    .find({ where: { user, active: true } });
  if (activeApiKeys && activeApiKeys.length) {
    for (const activeApiKey of activeApiKeys) {
      activeApiKey.active = false;
      activeApiKey.lastUpdatedDate = new Date();
      activeApiKey.lastUpdatedBy = user.id;
      await getConnection().getRepository(ApiKey).save(activeApiKey);
    }
  } else {
    return;
  }
};

/**
 * @description Soft deletes API key from user profile menu
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const deleteApiKeyAsUser = async (req: UserRequest, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json('Invalid API key');
  }
  const apiKey = await getConnection()
    .getRepository(ApiKey)
    .createQueryBuilder('apiKey')
    .leftJoinAndSelect('apiKey.user', 'user')
    .where('apiKey.id = :id', { id })
    .andWhere('user.id = :userId', { userId: +req.user })
    .getOne();
  if (!apiKey) {
    return res.status(404).json('API key not found');
  } else {
    apiKey.active = false;
    apiKey.lastUpdatedBy = +req.user;
    apiKey.lastUpdatedDate = new Date();
    await getConnection().getRepository(ApiKey).save(apiKey);
    return res.status(200).json('The API key has been deleted');
  }
};

/**
 * @description Soft deletes API key from Admin menu
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const deleteApiKeyAsAdmin = async (req: UserRequest, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json('Invalid API key');
  }
  const apiKey = await getConnection().getRepository(ApiKey).findOne({ where: { id: +id } });
  if (!apiKey) {
    return res.status(404).json('API key not found');
  } else {
    apiKey.active = false;
    apiKey.lastUpdatedDate = new Date();
    apiKey.lastUpdatedBy = +req.user;
    await getConnection().getRepository(ApiKey).save(apiKey);
    return res.status(200).json('The API key has been deactivated');
  }
};

/**
 * @description Retrieves Active API key metadata for user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns API key information
 */
export const getUserApiKeyInfo = async (req: UserRequest, res: Response) => {
  const apiKeyInfo = await getConnection()
    .getRepository(ApiKey)
    .createQueryBuilder('apiKey')
    .leftJoinAndSelect('apiKey.user', 'user')
    .where('apiKey.active = true')
    .andWhere('user.id = :userId', { userId: +req.user })
    .select(['apiKey.createdDate', 'apiKey.lastUpdatedDate', 'apiKey.id'])
    .getOne();
  if (!apiKeyInfo) {
    return res.status(200).json(null);
  } else {
    return res.status(200).json(apiKeyInfo);
  }
};

/**
 * @description Retrieves API key metadata for admin
 * @param {UserRequest} req
 * @param {Response} res
 * @returns API key information
 */
export const getAdminApiKeyInfo = async (req: UserRequest, res: Response) => {
  const apiKeyInfo = await getConnection()
    .getRepository(ApiKey)
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
};
