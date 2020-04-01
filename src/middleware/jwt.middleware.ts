import jwt = require('jsonwebtoken');

/**
 * @description Checks for valid token before API logic
 * @param {Request} req
 * @param {Response} res
 */
const checkToken = (req, res, next) => {
  const token = req.headers.authorization; // Express headers are auto converted to lowercase
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json('Authorization token is not valid');
      } else {
        req.user = decoded.userId;
        next();
      }
    });
  } else {
    return res.status(401).json('Authorization token not supplied');
  }
};

module.exports = {
  checkToken
};
