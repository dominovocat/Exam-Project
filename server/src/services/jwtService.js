const jwt = require("jsonwebtoken");
const { createJWTBody: createJWTBody } = require("../utils/user.utils");
const { JWT_SECRET, ACCESS_TOKEN_TIME } = require("../constants");

module.exports.createAccessToken = (user) => {
  return jwt.sign(createJWTBody(user), JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TIME,
  });
};

module.exports.verifyAccessToken = (accessToken) => {
  return jwt.verify(accessToken, JWT_SECRET);
};
