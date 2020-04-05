import { UserRequest } from '../interfaces/user-request.interface';
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import uuidv4 = require('uuid/v4');
import { Response } from 'express';
import jwt = require('jsonwebtoken');
// tslint:disable-next-line: no-var-requires
const passwordUtility = require('../utilities/password.utility');
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
    .where('user.email = :email', {
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
    const valid = await passwordUtility.compare(password, user.password);
    if (valid) {
      // TODO: Generate secret key and store in env var
      const token = jwt.sign({ email: user.email, userId: user.id }, process.env.JWT_KEY, { expiresIn: '.5h' });
      return res.status(200).json(token);
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
    return res
      .status(400)
      .json('Unable to retrieve the user at this time.  Please contact an administrator for assistance.');
  }
  user.uuid = uuidv4();
  await getConnection().getRepository(User).save(user);
  if (!user.active) {
    emailService.sendVerificationEmail(user.uuid, user.email);
    return res
      .status(400)
      .json('This account has not been activated.  Please check for email verification or contact an administrator.');
  } else {
    emailService.sendForgotPasswordEmail(user.uuid, user.email);
    return res.status(200).json('A password reset UserRequest has been initiated.  Please check your email.');
  }
};
module.exports = {
  login,
  forgotPassword
};
