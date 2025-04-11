import jwt = require('jsonwebtoken');
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import { UserRequest } from '../interfaces/user-request.interface';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { ROLE } from '../enums/roles-enum';
import { Response } from 'express';
import { ApiKey } from '../entity/ApiKey';
import { compare } from '../utilities/password.utility';

/**
 * @description Checks for valid token before API logic
 * @param {Request} req
 * @param {Response} res
 */
export const checkToken = async (req: UserRequest, res: Response, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization; // Express headers are auto converted to lowercase
    jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json('Authorization token is not valid');
      } else {
        req.user = decoded.userId;
        await fetchRoles(req);
        next();
      }
    });
  } else {
    const apiKey = req.header('Bulwark-Api-Key');
    const secretApiKey = req.header('Bulwark-Secret-Key');
    if (apiKey && secretApiKey) {
      await fetchRoles(req, res, apiKey, secretApiKey, next);
    } else {
      return res.status(401).json('Authorization token not supplied');
    }
  }
};

/**
 * @description Checks for valid token before API logic
 * @param {Request} req
 * @param {Response} res
 */
export const checkRefreshToken = (req, res, next) => {
  const token = req.body.refreshToken;
  if (token) {
    jwt.verify(token, process.env.JWT_REFRESH_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json('Authorization token is not valid');
      } else {
        req.user = decoded.userId;
        next();
      }
    });
  } else {
    return res.status(401).json('Refresh token not supplied');
  }
};

/**
 * @description Validates Admin user role before executing route
 * @param {Request} req
 * @param {Response} res
 */
export const isAdmin = async (req, res, next) => {
  const userRepository = AppDataSource.getRepository(User);
  
  const user = await userRepository.findOne({
    where: { id: req.user },
    relations: ['teams']
  });
  
  if (user && user.teams.some((team) => team.role === ROLE.ADMIN)) {
    next();
  } else {
    return res.status(403).json('Authorization is required');
  }
};

// Determine if the user is an Administrator
// If the user is an administrator, return all organizations and assets
// Else return only the organization and assets associated to team
export const fetchRoles = async (
  req?: UserRequest,
  res?: Response,
  apiKey?: string | string[],
  secretKey?: string | string[],
  next?
) => {
  let user: User;
  if (apiKey && secretKey && res) {
    try {
      const apiKeyInfo = await fetchUserByApiKey(apiKey, secretKey);
      if (!apiKeyInfo) {
        return res
          .status(401)
          .json('The provided API key or Secret key is not valid');
      } else {
        user = apiKeyInfo.user;
        req.user = user.id.toString();
        await setUserRoles(req, user);
        next();
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      return res.status(401).json('Authentication failed');
    }
  } else {
    try {
      user = await fetchUserByJwt(req.user);
      await setUserRoles(req, user);
    } catch (error) {
      console.error('Error fetching user by JWT:', error);
      if (res) {
        return res.status(401).json('Authentication failed');
      }
    }
  }
};

const setUserRoles = async (req: UserRequest, user: User) => {
  const organizationRepository = AppDataSource.getRepository(Organization);
  const assetRepository = AppDataSource.getRepository(Asset);
  
  req.userTeams = user.teams;
  const isAdmin = req.userTeams.some((team) => team.role === ROLE.ADMIN);
  
  if (isAdmin) {
    const orgs = await organizationRepository.find();
    const assets = await assetRepository.find();
    
    req.userOrgs = orgs.map((org) => org.id);
    req.userAssets = assets.map((asset) => asset.id);
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
    req.userOrgs = req.userTeams.map((team) => team.organization.id);
    req.userAssets = [];
    
    for (const team of req.userTeams) {
      if (team.assets && team.assets.length > 0) {
        const assets = team.assets.map((asset) => asset.id);
        req.userAssets.push(...assets);
      }
    }
    
    // Remove duplicate asset IDs
    req.userAssets = [...new Set(req.userAssets)];
  }
};

const fetchUserByApiKey = async (
  apiKey: string | string[],
  secretKey: string | string[]
) => {
  const apiKeyRepository = AppDataSource.getRepository(ApiKey);
  
  const apiKeyInfo = await apiKeyRepository.findOne({
    where: { key: apiKey.toString(), active: true },
    relations: ['user', 'user.teams', 'user.teams.organization', 'user.teams.assets']
  });
  
  if (!apiKeyInfo) {
    return null;
  }
  
  const valid = await compare(secretKey, apiKeyInfo.secretKey);
  if (valid) {
    return apiKeyInfo;
  } else {
    return null;
  }
};

const fetchUserByJwt = async (userId: string): Promise<User> => {
  const userRepository = AppDataSource.getRepository(User);
  
  const user = await userRepository.findOne({
    where: { id: parseInt(userId) },
    relations: ['teams', 'teams.organization', 'teams.assets']
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};