import * as nodemailer from 'nodemailer';
import { AppDataSource } from '../data-source';
import { Config } from '../entity/Config';
import { decrypt } from '../utilities/crypto.utility';
import { User } from '../entity/User';

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailCallback {
  (error: string | null, info: string | null): void;
}

/**
 * @description Send email
 * @param {MailOptions} mailOptions
 * @param {EmailCallback} callback
 */
export const sendEmail = async (mailOptions: MailOptions, callback: EmailCallback) => {
  try {
    const configRepository = AppDataSource.getRepository(Config);
    const config = await configRepository.findOne({ where: { id: 1 } });
    
    if (!config || !config.fromEmail || !config.fromEmailPassword) {
      console.error('Missing email configuration');
      return callback('Missing email configuration', null);
    }
    
    // Decrypt the email password
    let decryptedEmailPassword: string;
    try {
      decryptedEmailPassword = decrypt(config.fromEmailPassword);
    } catch (error) {
      console.error('Error decrypting email password:', error);
      return callback('Error with email configuration', null);
    }
    
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.fromEmail,
        pass: decryptedEmailPassword,
      },
    });
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        return callback('Error sending email', null);
      } else {
        return callback(null, 'Email sent successfully');
      }
    });
  } catch (error) {
    console.error('Email service error:', error);
    return callback('Email service error', null);
  }
};

/**
 * @description Prepare account verification email
 * @param {string} uuid
 * @param {string} userEmail
 */
export const sendVerificationEmail = (uuid: string, userEmail: string) => {
  const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost';
  const serverPort = process.env.PORT || '5000';
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@bulwark.com',
    subject: 'Bulwark - Please confirm your email address',
    text: `Please confirm your email address

A Bulwark account was created with the email: ${userEmail}.
As an extra security measure, please verify this is the correct email address
linked to Bulwark by clicking the link below.

${serverAddress}:${serverPort}/api/user/verify/${uuid}`,
    to: userEmail,
  };
  
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending verification email:', err);
    } else {
      console.log('Verification email sent successfully');
    }
  });
};

/**
 * @description Prepare password reset email
 * @param {string} uuid
 * @param {string} userEmail
 */
export const sendForgotPasswordEmail = (uuid: string, userEmail: string) => {
  const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost';
  const serverPort = process.env.PORT || '5000';
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@bulwark.com',
    subject: 'Bulwark - Forgot Password Request',
    text: `Forgot password request

A password request has been initiated for the email: ${userEmail}.
Please click the link below to initiate the process.

${serverAddress}:${serverPort}/#/password-reset/${uuid}`,
    to: userEmail,
  };
  
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending forgot password email:', err);
    } else {
      console.log('Forgot password email sent successfully');
    }
  });
};

/**
 * @description Prepare invitation email
 * @param {string} uuid
 * @param {string} userEmail
 */
export const sendInvitationEmail = (uuid: string, userEmail: string) => {
  const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost';
  const serverPort = process.env.PORT || '5000';
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@bulwark.com',
    subject: 'Bulwark - Welcome!',
    text: `You have been invited to Bulwark!
Please click the link below to initiate the process.

${serverAddress}:${serverPort}/#/register/${uuid}`,
    to: userEmail,
  };
  
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending invitation email:', err);
    } else {
      console.log('Invitation email sent successfully');
    }
  });
};

/**
 * @description Prepare email update request
 * @param {User} user
 * @param {EmailCallback} callback
 */
export const sendUpdateUserEmail = (user: User, callback: EmailCallback) => {
  const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost';
  const serverPort = process.env.PORT || '5000';
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@bulwark.com',
    subject: 'Bulwark - Email update request',
    text: `An email update has been requested for Bulwark. Please click the link to confirm this update.
    
${serverAddress}:${serverPort}/#/email/validate/${user.uuid}`,
    to: user.newEmail,
  };
  
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, info);
    }
  });
};