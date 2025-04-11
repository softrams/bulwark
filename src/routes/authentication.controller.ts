import { UserRequest } from '../interfaces/user-request.interface';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import jwt = require('jsonwebtoken');
import {
  generateHash,
  passwordSchema,
  compare,
} from '../utilities/password.utility';
import { passwordRequirement } from '../enums/message-enum';
import * as emailService from '../services/email.service';
import { Config } from '../entity/Config';
import { ROLE } from '../enums/roles-enum';

/**
 * @description Login to the application
 * @param {UserRequest} req
 * @param {Response} res
 * @returns valid JWT token
 */
const login = async (req: UserRequest, res: Response) => {
  try {
    const { password, email } = req.body;
    
    if (!email || !password) {
      return res.status(400).json('Email and password are required');
    }
    
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.teams', 'team')
      .where('user.email = :email', {
        email,
      })
      .getOne();
    
    if (!user) {
      return res.status(400).json('Invalid email or password');
    }
    
    if (!user.active) {
      // Generate new UUID for verification
      user.uuid = uuidv4();
      await userRepository.save(user);
      
      // Check if email config exists
      const configRepository = AppDataSource.getRepository(Config);
      const config = await configRepository.findOne({ where: { id: 1 } });
      
      if (!config || !config.fromEmail || !config.fromEmailPassword) {
        emailService.sendVerificationEmail(user.uuid, user.email);
        return res
          .status(400)
          .json(
            'This account has not been activated. The email configuration has not been set. Please contact an administrator'
          );
      }
      
      return res
        .status(400)
        .json(
          'This account has not been activated. Please check for email verification or contact an administrator.'
        );
    }
    
    // Verify password
    let valid: boolean;
    try {
      valid = await compare(password, user.password);
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(400).json('Authentication failed');
    }
    
    if (valid) {
      const tokens = generateTokens(user);
      return res.status(200).json(tokens);
    } else {
      return res.status(400).json('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json('An error occurred during login');
  }
};

/**
 * @description Initiates forgot password process
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const forgotPassword = async (req: UserRequest, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json('Email is invalid');
    }
    
    const userRepository = AppDataSource.getRepository(User);
    const configRepository = AppDataSource.getRepository(Config);
    
    // Always return the same response regardless of whether the user exists
    // This prevents user enumeration attacks
    const successMessage = 'A password reset request has been initiated. Please check your email.';
    
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', {
        email,
      })
      .getOne();
    
    if (!user) {
      return res.status(200).json(successMessage);
    }
    
    // Generate and save UUID for password reset
    user.uuid = uuidv4();
    await userRepository.save(user);
    
    // Check if email config exists
    const config = await configRepository.findOne({ where: { id: 1 } });
    
    if (!config || !config.fromEmail || !config.fromEmailPassword) {
      emailService.sendForgotPasswordEmail(user.uuid, user.email);
      return res
        .status(400)
        .json(
          'Unable to initiate the password reset process. The email configuration has not been set. Please contact an administrator.'
        );
    }
    
    // Send email and return success
    emailService.sendForgotPasswordEmail(user.uuid, user.email);
    return res.status(200).json(successMessage);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json('An error occurred during the password reset process');
  }
};

/**
 * @description Reset user password
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Success message
 */
const resetPassword = async (req: UserRequest, res: Response) => {
  try {
    const { password, confirmPassword, uuid } = req.body;
    
    if (!password || !confirmPassword || !uuid) {
      return res.status(400).json('Missing required fields');
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
    
    if (!user) {
      return res
        .status(400)
        .json(
          'Unable to reset user password at this time. Please contact an administrator for assistance.'
        );
    }
    
    user.password = await generateHash(password);
    user.uuid = null; // Clear the reset token after use
    
    await userRepository.save(user);
    return res.status(200).json('Password updated successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json('An error occurred during password reset');
  }
};

/**
 * @description Refresh Session
 * @param {UserRequest} req
 * @param {Response} res
 * @returns Tokens
 */
const refreshSession = async (req: UserRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.teams', 'team')
      .where('user.id = :userId', {
        userId: req.user,
      })
      .getOne();
    
    if (!user) {
      return res.status(404).json('User not found');
    }
    
    const tokens = generateTokens(user);
    return res.status(200).json(tokens);
  } catch (error) {
    console.error('Session refresh error:', error);
    return res.status(500).json('An error occurred while refreshing the session');
  }
};

/**
 * @description Generate Tokens
 * @param {User} user
 * @returns JWT tokens
 */
const generateTokens = (user: User) => {
  const isAdmin = user.teams && user.teams.some((team) => team.role === ROLE.ADMIN);
  
  const token = jwt.sign(
    { userId: user.id, admin: isAdmin },
    process.env.JWT_KEY,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: '8h' }
  );
  
  return {
    token,
    refreshToken,
  };
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  refreshSession,
};