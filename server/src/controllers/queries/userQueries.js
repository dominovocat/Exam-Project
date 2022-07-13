const bd = require("../../models");
const NotFound = require("../../errors/UserNotFoundError");
const ServerError = require("../../errors/ServerError");
const bcrypt = require("bcrypt");
const db = require("../../models");

module.exports.updateUser = async (data, userId, transaction) => {
  const [updatedCount, [updatedUser]] = await bd.User.update(data, {
    where: { id: userId },
    returning: true,
    transaction,
  });
  if (updatedCount !== 1) {
    throw new ServerError("cannot update user");
  }
  return updatedUser.dataValues;
};
module.exports.findUser = async (predicate, transaction) => {
  const result = await bd.User.findOne({ where: predicate, transaction });
  if (!result) {
    throw new NotFound("user with this data didn`t exist");
  } else {
    return result.get({ plain: true });
  }
};
module.exports.userCreation = async (data) => {
  const newUser = await bd.User.create(data);
  if (!newUser) {
    throw new ServerError("server error on user creation");
  }
  return newUser.get({ plain: true });
};

const passwordCompare = async (pass, pass_hash) => {
  const passwordCompare = await bcrypt.compare(pass, pass_hash);
  if (!passwordCompare) {
    throw new NotFound("Invalid email or password");
  }
};
module.exports.passwordCompare = passwordCompare;

module.exports.checkUserLogin = async (email, password) => {
  const foundUser = (await db.User.findOne({ email })).get({ plain: true });

  await passwordCompare(password, foundUser?.password || "");

  return foundUser;
};
