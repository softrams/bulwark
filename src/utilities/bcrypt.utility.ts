import * as bcrypt from 'bcrypt';

/**
 * @description Generate hash from password
 * @param {Request} req
 * @param {Response} res
 * @returns hashed password
 */
function generateHash(password) {
  const saltRounds = 10;
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

module.exports = {
  generateHash
};
