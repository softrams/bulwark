import * as bcrypt from 'bcrypt';
// tslint:disable-next-line: no-var-requires
const passwordValidator = require('password-validator');

// Create a password schema with requirements
export const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(12) // Minimum length 12
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .symbols(); // Must have symbols

// Number of salt rounds for bcrypt
const saltRounds = 10;

/**
 * @description Generate hash from password
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} - The hashed password
 */
export const generateHash = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, async (err, salt) => {
      if (err) {
        console.error('bcrypt salt generation error:', err);
        reject('Bcrypt hash failed: ' + err);
      } else {
        bcrypt.hash(password, salt, async (hashErr, hash: string) => {
          if (hashErr) {
            console.error('bcrypt hash error:', hashErr);
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
 * @description Update user password
 * @param {string} hashedCurrentPassword - The current hashed password
 * @param {string} currentPassword - The plaintext current password
 * @param {string} newPassword - The plaintext new password
 * @returns {Promise<string>} - The newly hashed password
 */
export const updatePassword = (
  hashedCurrentPassword: string,
  currentPassword: string,
  newPassword: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Verify the current password
      const valid = await compare(currentPassword, hashedCurrentPassword);
      
      if (!valid) {
        reject('The current password is incorrect');
        return;
      }
      
      // Generate a hash for the new password
      const newPasswordHash = await generateHash(newPassword);
      resolve(newPasswordHash);
    } catch (error) {
      console.error('Password update error:', error);
      reject('An error occurred while updating the password');
    }
  });
};

/**
 * @description Compare password hash
 * @param {string|string[]} currentPassword - The plaintext password to check
 * @param {string} hashedCurrentPassword - The stored hashed password
 * @returns {Promise<boolean>} - Whether the password is valid
 */
export const compare = (
  currentPassword: string | string[],
  hashedCurrentPassword: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!currentPassword || !hashedCurrentPassword) {
      reject('Password or hash is missing');
      return;
    }
    
    bcrypt.compare(currentPassword, hashedCurrentPassword, (err, valid) => {
      if (err) {
        console.error('bcrypt comparison error:', err);
        reject('Bcrypt comparison failure');
        return;
      }
      
      resolve(valid);
    });
  });
};