import { UserRequest } from '../interfaces/user-request.interface';
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import jwt = require('jsonwebtoken');
import { generateHash, passwordSchema, compare } from '../utilities/password.utility';
import { passwordRequirement } from '../enums/message-enum';
// tslint:disable-next-line: no-var-requires
const emailService = require('../services/email.service');

/**
 * @description Login to the application
 * @param {UserRequest} req
 * @param {Response} res
 * @returns valid JWT token
 */
const login = async (req: UserRequest, res: Response) => {
  const { password, email } = req.body;
  const user = await getConnection()
    .getRepository(User)
    .createQueryBuilder()
    .where('User.email = :email', {
      email
    })
    .getOne();
  if (user) {
    if (!user.active) {
      // generate new UUID
      user.uuid = uuidv4();
      // No need to validate as validation happend with user creation
      await getConnection().getRepository(User).save(user);
      emailService.sendVerificationEmail(user.uuid, user.email);
      return res
        .status(400)
        .json('This account has not been activated.  Please check for email verification or contact an administrator.');
    }
    let valid: boolean;
    try {
      valid = await compare(password, user.password);
    } catch (err) {
      return res.status(400).json(err);
    }
    if (valid) {
      const tokens = generateTokens(user);
      return res.status(200).json(tokens);
    } else {
      return res.status(400).json('Invalid email or password');
    }
  } else {
    return res.status(400).json('Invalid email or password');
  }
};
/**
 * @description Verifies user by comparing UUID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const forgotPassword = async (req: UserRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json('Email is invalid');
  }
  const user = await getConnection()
    .getRepository(User)
    .createQueryBuilder('user')
    .where('user.email = :email', {
      email
    })
    .getOne();
  if (!user) {
    return res.status(200).json('A password reset request has been initiated.  Please check your email.');
  }
  user.uuid = uuidv4();
  await getConnection().getRepository(User).save(user);
  emailService.sendForgotPasswordEmail(user.uuid, user.email);
  return res.status(200).json('A password reset request has been initiated.  Please check your email.');
};
/**
 * @description Reset user password
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const resetPassword = async (req: UserRequest, res: Response) => {
  const { password, confirmPassword, uuid } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json('Passwords do not match');
  }
  if (!passwordSchema.validate(password)) {
    return res.status(400).json(passwordRequirement);
  }
  const user = await getConnection()
    .getRepository(User)
    .createQueryBuilder()
    .where('User.uuid = :uuid', {
      uuid
    })
    .getOne();
  if (user) {
    user.password = await generateHash(password);
    user.uuid = null;
    await getConnection().getRepository(User).save(user);
    return res.status(200).json('Password updated successfully');
  } else {
    return res
      .status(400)
      .json('Unable to reset user password at this time.  Please contact an administrator for assistance.');
  }
};
/**
 * @description Refresh Session
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Tokens
 */
const refreshSession = async (req: UserRequest, res: Response) => {
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (user) {
    const tokens = generateTokens(user);
    res.status(200).json(tokens);
  } else {
    res.status(404).json('User not found');
  }
};
/**
 * @description Generate Tokens
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Tokens
 */
const generateTokens = (user: User) => {
  const token = jwt.sign({ userId: user.id }, process.env.JWT_KEY, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_KEY, { expiresIn: '8h' });
  const tokens = {
    token,
    refreshToken
  };
  return tokens;
};
module.exports = {
  login,
  forgotPassword,
  resetPassword,
  refreshSession
};
