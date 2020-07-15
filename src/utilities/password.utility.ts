import * as bcrypt from 'bcrypt';
// tslint:disable-next-line: no-var-requires
const passwordValidator = require('password-validator');

// Create a password schema
export const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(12) // Minimum length 8
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .symbols(); // Must have symbols

const saltRounds = 10;
/**
 * @description Generate hash from password
 * @param {Request} req
 * @param {Response} res
 * @returns hashed password
 */
export const generateHash = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, async (err, salt) => {
      if (err) {
        reject('Bcrypt hash failed: ' + err);
      } else {
        bcrypt.hash(password, salt, async (hashErr, hash: string) => {
          if (hashErr) {
            reject('Bcrypt hash failed: ' + hashErr);
          } else {
            resolve(hash);
          }
        });
      }
    });
  });
};
/**
 * @description Generate hash from password
 * @param {Request} req
 * @param {Response} res
 * @returns hashed password
 */
export const updatePassword = (oldPassword, currentPassword, newPassword): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const valid = await compare(currentPassword, oldPassword);
    if (valid) {
      const newPasswordHash = await generateHash(newPassword);
      resolve(newPasswordHash);
    } else {
      reject('Incorrect previous password');
    }
  });
};

/**
 * @description Compare password hash
 * @param {Request} req
 * @param {Response} res
 * @returns true/false
 */
export const compare = (currentPassword, oldPassword): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(currentPassword, oldPassword, (err, valid) => {
      if (err) {
        reject('Bcrypt comparison failure');
      }
      resolve(valid);
    });
  });
};
