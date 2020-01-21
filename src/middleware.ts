let jwt = require('jsonwebtoken');

/**
 * @description Checks for valid token before API logic
 * @param {Request} req
 * @param {Response} res
 */
let checkToken = (req, res, next) => {
  let token = req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token) {
    jwt.verify(token, 'keyboardcat', (err, decoded) => {
      if (err) {
        return res.status(401).json('Authorization token is not valid');
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json('Authorization token not supplied');
  }
};

module.exports = {
  checkToken: checkToken
};
