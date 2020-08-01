import nodemailer = require('nodemailer');
import * as emailService from './email.service';

describe('email service', () => {
  test('send email failure missing credentials', async () => {
    const mailOptions = {
      from: 'pentester3@gmail.com',
      subject: 'Bulwark - Please confirm your email address',
      text: `Please confirm your email address
                  \n A Bulwark account was created with the email: pentester@gmail.com.
                  As an extra security measure, please verify this is the correct email address
                  linked to Bulwark by clicking the link below.
                  \n dev/api/user/verify/123`,
      to: 'pentester2@gmail.com'
    };
    await emailService.sendEmail(mailOptions, (err, data) => {
      expect(err).toBe('Error sending email');
    });
  });
  test('send verification email success', async () => {
    const uuid = 'abc';
    const userEmail = 'pentester@gmail.com';
    const spy = jest.spyOn(emailService, 'sendEmail');
    await emailService.sendVerificationEmail(uuid, userEmail);
    expect(spy).toHaveBeenCalled();
  });
  test('send forgot password email success', async () => {
    const uuid = 'abc';
    const userEmail = 'pentester@gmail.com';
    const spy = jest.spyOn(emailService, 'sendEmail');
    await emailService.sendForgotPasswordEmail(uuid, userEmail);
    expect(spy).toHaveBeenCalled();
  });
  test('send invitation email', async () => {
    const uuid = 'abc';
    const userEmail = 'pentester@gmail.com';
    const spy = jest.spyOn(emailService, 'sendEmail');
    await emailService.sendInvitationEmail(uuid, userEmail);
    expect(spy).toHaveBeenCalled();
  });
});
