import jwt = require('jsonwebtoken');
import { getConnection } from 'typeorm';
import { Team } from '../entity/Team';
import { User } from '../entity/User';
import { ROLE } from '../enums/roles-enum';

/**
 * @description Checks for valid token before API logic
 * @param {Request} req
 * @param {Response} res
 */
export const checkToken = (req, res, next) => {
  const token = req.headers.authorization; // Express headers are auto converted to lowercase
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json('Authorization token is not valid');
      } else {
        req.user = decoded.userId;
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
