import { UserRequest } from '../interfaces/user-request.interface';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { passwordRequirement } from '../enums/message-enum';
import {
  compare,
  generateHash,
  passwordSchema,
  updatePassword,
} from '../utilities/password.utility';
import * as emailService from '../services/email.service';
import { Config } from '../entity/Config';
import { ROLE } from '../enums/roles-enum';
import { In } from 'typeorm';

/**
 * @description Register user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      title,
      password,
      confirmPassword,
      uuid,
    } = req.body;
    
    if (!firstName || !lastName || !title) {
      return res.status(400).json('Invalid registration form');
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json('Passwords do not match');
    }
    
    if (!passwordSchema.validate(password)) {
      return res.status(400).json(passwordRequirement);
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.uuid = :uuid', {
        uuid,
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
        console.error('Validation errors:', errors);
        return res.status(400).json('Invalid registration form');
      } else {
        await userRepository.save(user);
        return res.status(200).json('Registration Complete');
      }
    } else {
      return res
        .status(400)
        .json(
          'Unable to register user password at this time. Please contact an administrator for assistance.'
        );
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json('An error occurred during registration');
  }
};

/**
 * @description Invite user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const invite = async (req: Request, res: Response) => {
  try {
    const configRepository = AppDataSource.getRepository(Config);
    const config = await configRepository.findOne({ where: { id: 1 } });
    
    if (!config || !config.fromEmail || !config.fromEmailPassword) {
      return res
        .status(400)
        .json(
          'Failed to invite user. Please set the email configuration in the Settings menu option.'
        );
    } else {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json('Email is invalid');
      }
      
      const userRepository = AppDataSource.getRepository(User);
      const existUser = await userRepository.find({ where: { email } });
      
      if (existUser.length) {
        return res
          .status(400)
          .json('A user associated to that email has already been invited');
      }
      
      const user = new User();
      user.active = false;
      user.uuid = uuidv4();
      user.email = email;
      
      await userRepository.save(user);
      emailService.sendInvitationEmail(user.uuid, user.email);
      
      return res.status(200).json('User invited successfully');
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    return res.status(500).json('An error occurred while inviting the user');
  }
};

/**
 * @description Create user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns success message
 */
export const create = async (req: Request, res: Response) => {
  try {
    const {
      email,
      firstName,
      lastName,
      title,
      password,
      confirmPassword,
    } = req.body;
    
    if (
      !email ||
      !firstName ||
      !lastName ||
      !title ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json('Invalid user form');
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json('Passwords do not match');
    }
    
    if (!passwordSchema.validate(password)) {
      return res.status(400).json(passwordRequirement);
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const existUser = await userRepository
      .findOne({ where: { email } });
    
    if (existUser) {
      return res
        .status(400)
        .json('A user associated to that email has already been created');
    }
    
    const user = new User();
    user.active = true;
    user.uuid = uuidv4();
    user.email = email;
    user.newEmail = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.title = title;
    user.password = await generateHash(password);
    
    await userRepository.save(user);
    return res.status(200).json('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json('An error occurred while creating the user');
  }
};

/**
 * @description Verifies user by comparing UUID
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
export const verify = async (req: Request, res: Response) => {
  try {
    if (req.params.uuid) {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository
        .findOne({ where: { uuid: req.params.uuid } });
      
      if (user) {
        user.active = true;
        user.uuid = null;
        await userRepository.save(user);
        return res.status(200).json('Email verification successful');
      } else {
        return res
          .status(400)
          .json('Email verification failed. User does not exist.');
      }
    } else {
      return res.status(400).json('UUID is undefined');
    }
  } catch (error) {
    console.error('Error during verification:', error);
    return res.status(500).json('An error occurred during verification');
  }
};

/**
 * @description Updates user password
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
export const updateUserPassword = async (req: UserRequest, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const currentPassword = oldPassword;
    
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json('Passwords do not match');
    }
    
    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json('New password can not be the same as the old password');
    }
    
    if (!passwordSchema.validate(newPassword)) {
      return res.status(400).json(passwordRequirement);
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: +req.user } });
    
    if (user) {
      const hashedUserPassword = user.password;
      try {
        user.password = await updatePassword(
          hashedUserPassword,
          currentPassword,
          newPassword
        );
      } catch (err) {
        return res.status(400).json(err);
      }
      
      await userRepository.save(user);
      return res.status(200).json('Password updated successfully');
    } else {
      return res
        .status(400)
        .json(
          'Unable to update user password at this time. Please contact an administrator for assistance.'
        );
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json('An error occurred while updating the password');
  }
};

/**
 * @description Patch user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
export const patch = async (req: UserRequest, res: Response) => {
  try {
    const { firstName, lastName, title } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: +req.user } });
    
    if (!user) {
      return res.status(404).json('User not found');
    }
    
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
      await userRepository.save(user);
      return res.status(200).json('User patched successfully');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json('An error occurred while updating the user');
  }
};

/**
 * @description Get user
 * @param {UserRequest} req
 * @param {Response} res
 * @returns User
 */
export const getUser = async (req: UserRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository
      .findOne({ 
        where: { id: +req.user },
        relations: ['teams']
      });
    
    if (!user) return res.status(404).json('User not found');
    
    // Don't return sensitive data
    const userResponse = { ...user };
    delete userResponse.active;
    delete userResponse.password;
    delete userResponse.uuid;
    delete userResponse.id;
    
    return res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json('An error occurred while fetching the user');
  }
};

/**
 * @description Get Users
 * @param {UserRequest} req
 * @param {Response} res
 * @returns user array
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository
      .createQueryBuilder('user')
      .where('user.active = true')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.title'])
      .getMany();
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json('An error occurred while fetching users');
  }
};

/**
 * @description Get Testers
 * @param {UserRequest} req
 * @param {Response} res
 * @returns user array
 */
export const getTesters = async (req: UserRequest, res: Response) => {
  try {
    if (!req.params.orgId) {
      return res.status(400).json('Invalid Organization ID');
    }
    
    if (isNaN(+req.params.orgId)) {
      return res.status(400).json('Invalid Organization ID');
    }
    
    // Optional check for org access
    // if (!req.userOrgs.includes(+req.params.orgId)) {
    //   return res.status(404).json('Testers not found');
    // }
    
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.teams', 'teams')
      .leftJoinAndSelect('teams.organization', 'organization')
      .where('user.active = true')
      .andWhere('teams.role != :role', { role: ROLE.READONLY })
      .andWhere('teams.organization.id = :orgId', { orgId: +req.params.orgId })
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.title'])
      .getMany();
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching testers:', error);
    return res.status(500).json('An error occurred while fetching testers');
  }
};

/**
 * @description Get all active/inactive users
 * @param {UserRequest} req
 * @param {Response} res
 * @returns user array
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.teams', 'teams')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.title',
        'user.active',
        'user.email',
        'teams.name',
      ])
      .getMany();
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json('An error occurred while fetching all users');
  }
};

/**
 * @description Get user IDs and validate users
 * @param {number[]} userIds
 * @returns User array
 */
export const getUsersById = async (userIds: number[]) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      where: { id: In(userIds) }
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users by ID:', error);
    return [];
  }
};

/**
 * @description Send email update request
 * @param {UserRequest} req
 * @param {Response} res
 * @returns string
 */
export const updateUserEmail = async (req: UserRequest, res: Response) => {
  try {
    const email = req.body.email;
    const newEmail = req.body.newEmail;
    
    if (email !== newEmail) {
      return res
        .status(400)
        .json('The new email address and confirmation email address must match');
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: +req.user } });
    
    if (!user) {
      return res.status(404).json('User not found');
    }
    
    if (user.newEmail) {
      return res
        .status(400)
        .json(
          'An email update request is already in progress. Please revoke this current request and try again.'
        );
    }
    
    // Check if email is already taken
    const existingUsers = await userRepository.find({
      select: ['email']
    });
    
    const existingEmails = existingUsers.map((x) => x.email);
    if (existingEmails.includes(email)) {
      return res.status(400).json('Email is already taken');
    }
    
    user.uuid = uuidv4();
    user.newEmail = email;
    
    const errors = await validate(user);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json('Email is invalid');
    } else {
      await userRepository.save(user);
      
      emailService.sendUpdateUserEmail(user, (err, info) => {
        if (err) {
          return res
            .status(400)
            .json(
              'There was a problem updating your email address. Please contact an administrator for assistance.'
            );
        } else {
          return res
            .status(200)
            .json(`A confirmation email has been sent to ${user.newEmail}`);
        }
      });
    }
  } catch (error) {
    console.error('Error updating email:', error);
    return res.status(500).json('An error occurred while updating the email');
  }
};

/**
 * @description Revoke current email update request
 * @param {UserRequest} req
 * @param {Response} res
 * @returns string
 */
export const revokeEmailRequest = async (req: UserRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: +req.user } });
    
    if (!user || !user.newEmail) {
      return res
        .status(404)
        .json('An email update request for this user does not exist');
    }
    
    user.newEmail = null;
    user.uuid = null;
    
    await userRepository.save(user);
    return res
      .status(200)
      .json('The email update request has been successfully revoked');
  } catch (error) {
    console.error('Error revoking email request:', error);
    return res.status(500).json('An error occurred while revoking the email request');
  }
};

/**
 * @description Validate current email update request
 * @param {UserRequest} req
 * @param {Response} res
 * @returns string
 */
export const validateEmailRequest = async (req: UserRequest, res: Response) => {
  try {
    if (!req.body.password || !req.body.uuid) {
      return res.status(400).json('The password or UUID is missing');
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository
      .findOne({ where: { uuid: req.body.uuid } });
    
    if (!user) {
      return res
        .status(404)
        .json('A user associated with this UUID does not exist');
    }
    
    const valid = await compare(req.body.password, user.password);
    if (!valid) {
      return res.status(400).json('The password is incorrect');
    } else {
      user.email = user.newEmail;
      user.uuid = null;
      user.newEmail = null;
      
      await userRepository.save(user);
      return res.status(200).json('Your email has been successfully updated');
    }
  } catch (error) {
    console.error('Error validating email request:', error);
    return res.status(500).json('An error occurred while validating the email request');
  }
};