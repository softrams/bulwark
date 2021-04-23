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
export const updatePassword = (
  hashedCurrentPassword: string,
  currentPassword: string,
  newPassword: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const valid = await compare(currentPassword, hashedCurrentPassword);
    if (valid) {
      const newPasswordHash = await generateHash(newPassword);
      resolve(newPasswordHash);
    } else {
      reject('The current password is incorrect');
    }
  });
};

/**
 * @description Compare password hash
 * @param {Request} req
 * @param {Response} res
 * @returns true/false
 */
export const compare = (
  currentPassword: string | string[],
  hashedCurrentPassword: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(currentPassword, hashedCurrentPassword, (err, valid) => {
      if (err) {
        reject('Bcrypt comparison failure');
      }
      resolve(valid);
    });
  });
};
