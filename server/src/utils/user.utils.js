const lodash = require("lodash");

module.export.prepareUser = (user) => {
  return lodash.omit(user, ["password", "accessToken"]);
};

module.export.createJWTBody = (user) => {
  return {
    ...lodash.omit(user, ["password", "accessToken", "id"]),
    userId: user.id,
  };
};
