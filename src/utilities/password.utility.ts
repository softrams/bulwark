import * as bcrypt from 'bcrypt';
// tslint:disable-next-line: no-var-requires
const passwordValidator = require('password-validator');

// Create a password schema
const passwordSchema = new passwordValidator();
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
const generateHash = password => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, async (err, salt) => {
      if (err) {
        return Error('Bcrypt hash failed: ' + err);
      } else {
        bcrypt.hash(password, salt, async (hashErr, hash) => {
          if (hashErr) {
            return Error('Bcrypt hash failed: ' + hashErr);
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
const updatePassword = (oldPassword, currentPassword, newPassword, callback) => {
  return new Promise(async (resolve, reject) => {
    const valid = await compare(oldPassword, currentPassword);
    if (valid) {
      resolve(await generateHash(newPassword));
    } else {
      callback(400, JSON.stringify('Incorrect previous password'));
    }
  });
};

/**
 * @description Compare password hash
 * @param {Request} req
 * @param {Response} res
 * @returns true/false
 */
const compare = (oldPassword, currentPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(oldPassword, currentPassword, (err, valid) => {
      resolve(valid);
    });
  });
};

module.exports = {
  generateHash,
  updatePassword,
  compare,
  passwordSchema
};
