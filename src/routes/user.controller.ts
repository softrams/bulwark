import { UserRequest } from '../interfaces/user-request.interface';
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import { Response } from 'express';
import uuidv4 = require('uuid/v4');
import { validate } from 'class-validator';
import { passwordRequirement } from '../enums/message-enum';
// tslint:disable-next-line: no-var-requires
const passwordUtility = require('../utilities/password.utility');
// tslint:disable-next-line: no-var-requires
const emailService = require('../services/email.service');
/**
 * @description Create user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
const create = async (req: UserRequest, res: Response) => {
  const user = new User();
  const { password, confirmPassword, email } = req.body;
  if (!email) {
    return res.status(400).json('Email is invalid');
  }
  const existUser = await getConnection().getRepository(User).find({ where: { email } });
  if (existUser.length) {
    return res.status(400).json('A user associated to that email already exists');
  }
  user.email = email;
  if (password !== confirmPassword) {
    return res.status(400).json('Passwords do not match');
  }
  if (!passwordUtility.passwordSchema.validate(password)) {
    return res.status(400).json(passwordRequirement);
  }
  user.password = await passwordUtility.generateHash(password);
  user.active = false;
  user.uuid = uuidv4();
  const errors = await validate(user);
  if (errors.length > 0) {
    return res.status(400).json('User validation failed');
  } else {
    await getConnection().getRepository(User).save(user);
    emailService.sendVerificationEmail(user.uuid, user.email);
    return res.status(200).json('User created successfully');
  }
};
/**
 * @description Register user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
const register = async (req: UserRequest, res: Response) => {
  const { password, confirmPassword, uuid } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json('Passwords do not match');
  }
  if (!passwordUtility.passwordSchema.validate(password)) {
    return res.status(400).json(passwordRequirement);
  }
  const user = await getConnection()
    .getRepository(User)
    .createQueryBuilder()
    .where('User.uuid = :uuid', {
      uuid,
    })
    .getOne();
  if (user) {
    user.password = await passwordUtility.generateHash(password);
    user.uuid = null;
    user.active = true;
    await getConnection().getRepository(User).save(user);
    return res.status(200).json('Registration Complete');
  } else {
    return res
      .status(400)
      .json('Unable to register user password at this time.  Please contact an administrator for assistance.');
  }
};
/**
 * @description Invite user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
const invite = async (req: UserRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json('Email is invalid');
  }
  const existUser = await getConnection().getRepository(User).find({ where: { email } });
  if (existUser.length) {
    return res.status(400).json('A user associated to that email has already been invited');
  }
  const user = new User();
  user.active = false;
  user.uuid = uuidv4();
  user.email = email;
  await getConnection().getRepository(User).save(user);
  emailService.sendInvitationEmail(user.uuid, user.email);
  return res.status(200).json('User invited successfully');
};
/**
 * @description Verifies user by comparing UUID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const verify = async (req: UserRequest, res: Response) => {
  if (req.params.uuid) {
    const user = await getConnection()
      .getRepository(User)
      .findOne({ where: { uuid: req.params.uuid } });
    if (user) {
      user.active = true;
      user.uuid = null;
      getConnection().getRepository(User).save(user);
      return res.status(200).json('Email verification successful');
    } else {
      return res.status(400).json('Email verification failed.  User does not exist.');
    }
  } else {
    return res.status(400).json('UUID is undefined');
  }
};
/**
 * @description Updates user password
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const updatePassword = async (req: UserRequest, res: Response) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json('Passwords do not match');
  }
  if (newPassword === oldPassword) {
    return res.status(400).json('New password can not be the same as the old password');
  }
  if (!passwordUtility.passwordSchema.validate(newPassword)) {
    return res.status(400).json(passwordRequirement);
  }
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (user) {
    const callback = (resStatus: number, message: any) => {
      res.status(resStatus).send(message);
    };
    user.password = await passwordUtility.updatePassword(oldPassword, user.password, newPassword, callback);
    await getConnection().getRepository(User).save(user);
    return res.status(200).json('Password updated successfully');
  } else {
    return res
      .status(400)
      .json('Unable to update user password at this time.  Please contact an administrator for assistance.');
  }
};
/**
 * @description Patch user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const patch = async (req: UserRequest, res: Response) => {
  const { firstName, lastName, title } = req.body;
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (firstName) {
    user.firstName = firstName;
  }
  if (lastName) {
    user.lastName = lastName;
  }
  if (title) {
    user.title = title;
  }
  user.uuid = null;
  const errors = await validate(user);
  if (errors.length > 0) {
    return res.status(400).json(errors);
  } else {
    await getConnection().getRepository(User).save(user);
    return res.status(200).json('User patched successfully');
  }
};
/**
 * @description Get user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns User
 */
const getUser = async (req: UserRequest, res: Response) => {
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (!user) return res.status(404).json('User not found');
  delete user.active;
  delete user.password;
  delete user.uuid;
  delete user.id;
  return res.status(200).json(user);
};
module.exports = {
  create,
  verify,
  updatePassword,
  invite,
  register,
  patch,
  getUser,
};
