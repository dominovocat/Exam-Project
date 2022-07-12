const lodash = require("lodash");

module.export.prepareUser = (user) => {
  return lodash.omit(user, ["password", "accessToken"]);
};
