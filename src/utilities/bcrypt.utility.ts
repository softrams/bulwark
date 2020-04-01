import * as bcrypt from 'bcrypt';

const saltRounds = 10;
/**
 * @description Generate hash from password
 * @param {Request} req
 * @param {Response} res
 * @returns hashed password
 */
function generateHash(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, async (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          reject();
          return Error('Unable to create user');
        } else {
          resolve(hash);
        }
      });
    });
  });
}
/**
 * @description Generate hash from password
 * @param {Request} req
 * @param {Response} res
 * @returns hashed password
 */
function updatePassword(oldPassword, currentPassword, newPassword, callback) {
  return new Promise(async (resolve, reject) => {
    const valid = await compare(oldPassword, currentPassword);
    if (valid) {
      resolve(await generateHash(newPassword));
    } else {
      callback(400, JSON.stringify('Incorrect previous password'));
    }
  });
}

/**
 * @description Compare password hash
 * @param {Request} req
 * @param {Response} res
 * @returns true/false
 */
function compare(oldPassword, currentPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(oldPassword, currentPassword, (err, valid) => {
      resolve(valid);
    });
  });
}

module.exports = {
  generateHash,
  updatePassword,
  compare
};
