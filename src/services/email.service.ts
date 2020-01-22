const nodemailer = require('nodemailer');

// NODE ENV
const env = process.env.NODE_ENV || 'dev';

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.FROM_EMAIL_PASSWORD
  }
});

/**
 * @description Send email
 * @param {object} mailOptions
 * @returns string
 */
function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return 'Error sending email';
    } else {
      return 'email sent successfully';
    }
  });
}

/**
 * @description Prepare account verification email
 * @param {string} uuid
 * @returns string
 */
function sendVerificationEmail(uuid, userEmail) {
  let mailOptions = {
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject: 'Bulwark - Please confirm your email address',
    text: `Please confirm your email address
              \n A Bulwark account was created with the email: ${userEmail}.  As an extra security measure, please verify this is the correct email address linked to Bulwark by clicking the link below.
              \n ${process.env.PROD_URL}/api/user/verify/${uuid}`
  };
  sendEmail(mailOptions);
}

/**
 * @description Prepare passwored reset email
 * @param {string} uuid
 * @returns string
 */
function sendForgotPasswordEmail(uuid, userEmail) {
  let mailOptions = {
    from: process.env.FROM_EMAIL,
    to: userEmail,
    subject: 'Bulwark - Forgot Password Request',
    text: `Forgot password request
                \n A password request has been initiated for the email: ${userEmail}.  Please click the link below to initiate the process.
                \n ${process.env.PROD_URL}/#/password-reset/${uuid}`
  };
  sendEmail(mailOptions);
}

module.exports = {
  sendVerificationEmail,
  sendForgotPasswordEmail
};
