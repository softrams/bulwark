import nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  auth: {
    pass: process.env.FROM_EMAIL_PASSWORD,
    user: process.env.FROM_EMAIL
  },
  service: 'Gmail'
});

/**
 * @description Send email
 * @param {object} mailOptions
 * @returns string
 */
const sendEmail = mailOptions => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return 'Error sending email';
    } else {
      return 'email sent successfully';
    }
  });
};

/**
 * @description Prepare account verification email
 * @param {string} uuid
 * @returns string
 */
const sendVerificationEmail = (uuid, userEmail) => {
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
  sendEmail(mailOptions);
};

/**
 * @description Prepare passwored reset email
 * @param {string} uuid
 * @returns string
 */
const sendForgotPasswordEmail = (uuid, userEmail) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    subject: 'Bulwark - Forgot Password Request',
    text: `Forgot password request
                \n A password request has been initiated for the email: ${userEmail}.
                Please click the link below to initiate the process.
                \n ${process.env.PROD_URL}/#/password-reset/${uuid}`,
    to: userEmail
  };
  sendEmail(mailOptions);
};

module.exports = {
  sendForgotPasswordEmail,
  sendVerificationEmail
};
