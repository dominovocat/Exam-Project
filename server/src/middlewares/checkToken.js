const TokenError = require("../errors/TokenError");
const userQueries = require("../controllers/queries/userQueries");
const {
  verifyAccessToken,
  verifyRefreshToken,
} = require("../services/jwtService");
const createHttpError = require("http-errors");

module.exports.checkAuth = async (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return next(createHttpError(401, "need token"));
  }
  try {
    const tokenData = verifyAccessToken(accessToken);
    const foundUser = await userQueries.findUser({ id: tokenData.userId });
    res.send({
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      role: foundUser.role,
      id: foundUser.id,
      avatar: foundUser.avatar,
      displayName: foundUser.displayName,
      balance: foundUser.balance,
      email: foundUser.email,
    });
  } catch (err) {
    next(createHttpError(401, "token error"));
  }
};

module.exports.checkToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createHttpError(401, "need token"));
  }
  try {
    const [, token] = authHeader.split(" ");
    req.tokenData = verifyAccessToken(token);
    next();
  } catch (err) {
    next(createHttpError(401, "token error"));
  }
};
module.exports.checkRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Invalid token");
    }

    req.tokenData = verifyRefreshToken(refreshToken);
  } catch (error) {
    next(createHttpError(419, "Refresh expired"));
  }
};
