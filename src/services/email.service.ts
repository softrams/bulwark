import nodemailer = require('nodemailer');
import { getConnection } from 'typeorm';
import { Config } from '../entity/Config';
import { decrypt } from '../utilities/crypto.utility';
import { User } from '../entity/User';

/**
 * @description Send email
 * @param {object} mailOptions
 * @returns string
 */
export const sendEmail = async (mailOptions, callback) => {
  const config = await getConnection().getRepository(Config).findOne(1);
  if (config.fromEmail && config.fromEmailPassword) {
    const decryptedEmailPassword = decrypt(config.fromEmailPassword);
    const transporter = nodemailer.createTransport({
      auth: {
        pass: decryptedEmailPassword,
        user: config.fromEmail
      },
      service: 'Gmail'
    });
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return callback('Error sending email', null);
      } else {
        return callback(null, 'Email sent successfully');
      }
    });
  } else {
    console.error('Missing email configuration');
    return callback('Missing email configuration', null);
  }
};

/**
 * @description Prepare account verification email
 * @param {string} uuid
 * @returns string
 */
export const sendVerificationEmail = (uuid: string, userEmail: string) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    subject: 'Bulwark - Please confirm your email address',
    text: `Please confirm your email address
              \n A Bulwark account was created with the email: ${userEmail}.
              As an extra security measure, please verify this is the correct email address
              linked to Bulwark by clicking the link below.
              \n ${process.env.PROD_URL}/api/user/verify/${uuid}`,
    to: userEmail
  };
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      return info;
    }
  });
};

/**
 * @description Prepare passwored reset email
 * @param {string} uuid
 * @returns string
 */
export const sendForgotPasswordEmail = (uuid, userEmail) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    subject: 'Bulwark - Forgot Password Request',
    text: `Forgot password request
                \n A password request has been initiated for the email: ${userEmail}.
                Please click the link below to initiate the process.
                \n ${process.env.PROD_URL}/#/password-reset/${uuid}`,
    to: userEmail
  };
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      return info;
    }
  });
};

/**
 * @description Prepare invitation email
 * @param {string} uuid
 * @returns string
 */
export const sendInvitationEmail = (uuid, userEmail) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    subject: 'Bulwark - Welcome!',
    text: `You have been invited to Bulwark!
                Please click the link below to initiate the process.
                \n ${process.env.PROD_URL}/#/register/${uuid}`,
    to: userEmail
  };
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      return info;
    }
  });
};

/**
 * @description Prepare invitation email
 * @param {string} uuid
 * @returns string
 */
export const sendUpdateUserEmail = (user: User, callback) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    subject: 'Bulwark - Email update request',
    text: `An email update has been requested for Bulwark.  Please click the link to confirm this update. ${process.env.PROD_URL}/#/register/${user.uuid}`,
    to: user.newEmail
  };
  sendEmail(mailOptions, (err, info) => {
    if (err) {
      callback(err);
    } else {
      callback(null, info);
    }
  });
};
