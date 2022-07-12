const jwt = require("jsonwebtoken");
const { createJWTBody: createJWTBody } = require("../utils/user.utils");
const {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_TOKEN_TIME,
  REFRESH_TOKEN_TIME,
  MAX_SESSIONS_COUNT,
} = require("../constants");
const db = require("../models");
const createHttpError = require("http-errors");

const createAccessToken = (user) => {
  return jwt.sign(createJWTBody(user), ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TIME,
  });
};
module.exports.createAccessToken = createAccessToken;

const createRefreshToken = (user) => {
  return jwt.sign(createJWTBody(user), REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TIME,
  });
};
module.exports.createRefreshToken = createRefreshToken;

module.exports.verifyAccessToken = (accessToken) => {
  return jwt.verify(accessToken, ACCESS_SECRET);
};

module.exports.verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, REFRESH_SECRET);
};

const createTokenPair = (user) => {
  const tokenPair = {
    access: createAccessToken(user),
    refresh: createRefreshToken(user),
  };

  return tokenPair;
};
module.exports.createTokenPair = createTokenPair;

module.exports.createSession = async (user) => {
  const tokenPair = createTokenPair(user);

  const refresh = tokenPair.refresh;

  const sessions = await db.RefreshToken.findAll({
    where: { userId: user.id },
    order: [["updatedAt", "ASC"]],
  });
  if (sessions.length >= MAX_SESSIONS_COUNT) {
    const oldestToken = sessions[0];
    await db.RefreshToken.update(
      { value: refresh },
      { where: { id: oldestToken.id } }
    );
  } else {
    await db.RefreshToken.create({ value: refresh });
  }

  return tokenPair;
};

module.exports.refreshSession = async (refreshToken, tikenData) => {
  const foundToken = await db.RefreshToken.findOne({
    where: { value: refreshToken },
  });
  if (!foundToken) {
    throw createHttpError(419, "Refresh token not found");
  }

  await db.RefreshToken.destroy({ where: { id: foundToken.id } });
  const user = await userQueries.findUser({ id: req.tokenData.userId });
  const tokenPair = await createSession(user);
};
