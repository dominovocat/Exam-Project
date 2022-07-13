
const lodash = require("lodash");

module.exports.prepareUser = (user) => {
  return lodash.omit(user, ["password", "accessToken"]);
};

module.exports.createJWTBody = (user) => {
  return {
    ...lodash.omit(user, ["password", "accessToken", "id"]),
    userId: user.id,
  };
};
