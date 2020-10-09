import { UserRequest } from '../interfaces/user-request.interface';
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { passwordRequirement } from '../enums/message-enum';
import { compare, generateHash, passwordSchema, updatePassword } from '../utilities/password.utility';
import * as emailService from '../services/email.service';
import { Config } from '../entity/Config';
/**
 * @description Register user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, title, password, confirmPassword, uuid } = req.body;
  if (!firstName || !lastName || !title) {
    return res.status(400).json('Invalid registration form');
  }
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
    user.active = true;
    user.firstName = firstName;
    user.lastName = lastName;
    user.title = title;
    const errors = await validate(user, { skipMissingProperties: true });
    if (errors.length > 0) {
      return res.status(400).json('Invalid registration form');
    } else {
      await getConnection().getRepository(User).save(user);
      return res.status(200).json('Registration Complete');
    }
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
export const invite = async (req: Request, res: Response) => {
  const config = await getConnection().getRepository(Config).findOne(1);
  if (!config.fromEmail || !config.fromEmailPassword) {
    return res
      .status(400)
      .json('Failed to invite user. Please set the email configuration in the Settings menu option.');
  } else {
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
  }
};
/**
 * @description Verifies user by comparing UUID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
export const verify = async (req: Request, res: Response) => {
  if (req.params.uuid) {
    const user = await getConnection()
      .getRepository(User)
      .findOne({ where: { uuid: req.params.uuid } });
    if (user) {
      user.active = true;
      user.uuid = null;
      await getConnection().getRepository(User).save(user);
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
export const updateUserPassword = async (req: UserRequest, res: Response) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json('Passwords do not match');
  }
  if (newPassword === oldPassword) {
    return res.status(400).json('New password can not be the same as the old password');
  }
  if (!passwordSchema.validate(newPassword)) {
    return res.status(400).json(passwordRequirement);
  }
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (user) {
    try {
      user.password = await updatePassword(user.password, oldPassword, newPassword);
    } catch (err) {
      return res.status(400).json(err);
    }
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
export const patch = async (req: UserRequest, res: Response) => {
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
  const errors = await validate(user, { skipMissingProperties: true });
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
export const getUser = async (req: UserRequest, res: Response) => {
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (!user) return res.status(404).json('User not found');
  delete user.active;
  delete user.password;
  delete user.uuid;
  delete user.id;
  return res.status(200).json(user);
};
/**
 * @description Get Users
 * @param {UserRequest} req
 * @param {Response} res
 * @returns user array
 */
export const getUsers = async (req: Request, res: Response) => {
  const users = await getConnection()
    .getRepository(User)
    .createQueryBuilder('user')
    .where('user.active = true')
    .select(['user.id', 'user.firstName', 'user.lastName', 'user.title'])
    .getMany();
  return res.status(200).json(users);
};
/**
 * @description Get user IDs and validate users
 * @param {UserRequest} req
 * @param {Response} res
 * @returns User array
 */
export const getUsersById = async (userIds: number[]) => {
  const userArray: User[] = [];
  for (const iterator of userIds) {
    const user = await getConnection().getRepository(User).findOne(iterator);
    if (user) {
      userArray.push(user);
    }
  }
  return userArray;
};
/**
 * @description Send email update request
 * @param {UserRequest} req
 * @param {Response} res
 * @returns string
 */
export const updateUserEmail = async (req: UserRequest, res: Response) => {
  const email = req.body.email;
  const newEmail = req.body.newEmail;
  if (email !== newEmail) {
    return res.status(400).json('The new email address and confirmation email address must match');
  }
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (user.newEmail) {
    return res
      .status(400)
      .json('An email update request is already in progress. Please revoke this current request and try again.');
  }
  const emails = await getConnection()
    .getRepository(User)
    .find({ select: ['email'] });
  const existingEmails = emails.map((x) => x.email);
  if (existingEmails.includes(email)) {
    return res.status(400).json('Email is already taken');
  }
  user.uuid = uuidv4();
  user.newEmail = email;
  const errors = await validate(user);
  if (errors.length > 0) {
    return res.status(400).json('Email is invalid');
  } else {
    await getConnection().getRepository(User).save(user);
    emailService.sendUpdateUserEmail(user, (err, info) => {
      if (err) {
        return res
          .status(400)
          .json('There was a problem updating your email address.  Please contact an administrator for assistance.');
      } else {
        return res.status(200).json(`A confirmation email has been sent to ${user.newEmail}`);
      }
    });
  }
};
/**
 * @description Revoke current email update request
 * @param {UserRequest} req
 * @param {Response} res
 * @returns string
 */
export const revokeEmailRequest = async (req: UserRequest, res: Response) => {
  const user = await getConnection().getRepository(User).findOne(req.user);
  if (!user || !user.newEmail) {
    return res.status(404).json('An email update request for this user does not exist');
  }
  user.newEmail = null;
  user.uuid = null;
  await getConnection().getRepository(User).save(user);
  return res.status(200).json('The email update request has been successfully revoked');
};
/**
 * @description Validate current email update request
 * @param {UserRequest} req
 * @param {Response} res
 * @returns string
 */
export const validateEmailRequest = async (req: UserRequest, res: Response) => {
  if (!req.body.password || !req.body.uuid) {
    return res.status(400).json('The password or UUID is missing');
  }
  const user = await getConnection()
    .getRepository(User)
    .findOne({ where: { uuid: req.body.uuid } });
  if (!user) {
    return res.status(404).json('A user associated with this UUID does not exist');
  }
  const valid = await compare(req.body.password, user.password);
  if (!valid) {
    return res.status(401).json('The password is incorrect');
  } else {
    user.email = user.newEmail;
    user.uuid = null;
    user.newEmail = null;
    await getConnection().getRepository(User).save(user);
    return res.status(200).json('Your email has been successfully updated');
  }
};
