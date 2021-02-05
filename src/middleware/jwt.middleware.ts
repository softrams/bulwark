import jwt = require('jsonwebtoken');
import { Asset } from '../entity/Asset';
import { Organization } from '../entity/Organization';
import { UserRequest } from '../interfaces/user-request.interface';
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import { ROLE } from '../enums/roles-enum';
import { Response } from 'express';

/**
 * @description Checks for valid token before API logic
 * @param {Request} req
 * @param {Response} res
 */
export const checkToken = (req: UserRequest, res: Response, next) => {
  const token = req.headers.authorization; // Express headers are auto converted to lowercase
  if (token) {
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
    return res.status(401).json('Authorization token not supplied');
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
  const user = await getConnection()
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.teams', 'teams')
    .where('user.id = :userId', { userId: req.user })
    .getOne();
  if (user.teams.some((team) => team.role === ROLE.ADMIN)) {
    next();
  } else {
    return res.status(403).json('Authorization is required');
  }
};

// Determine if the user is an Administrator
// If the user is an administrator, return all organizations and assets
// Else return only the organization and assets associated to team
export const fetchRoles = async (req: UserRequest) => {
  const user = await getConnection()
    .getRepository(User)
    .findOne(req.user, {
      join: {
        alias: 'user',
        leftJoinAndSelect: {
          teams: 'user.teams',
          organization: 'teams.organization',
          assets: 'teams.assets',
        },
      },
    });
  req.userTeams = user.teams;
  const isAdmin = req.userTeams.some((team) => team.role === ROLE.ADMIN);
  if (isAdmin) {
    const orgs = await getConnection().getRepository(Organization).find({});
    const assets = await getConnection().getRepository(Asset).find({});
    req.userOrgs = orgs.map((org) => org.id);
    req.userAssets = assets.map((asset) => asset.id);
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
    req.userOrgs = req.userTeams.map((team) => team.organization.id);
    req.userAssets = [];
    for (const team of req.userTeams) {
      const assets = team.assets.map((asset) => asset.id);
      for (const asset of assets) {
        req.userAssets.push(asset);
      }
    }
  }
};
