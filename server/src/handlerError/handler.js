const { MulterError } = require("multer");
const {
  BaseError,
  UniqueConstraintError,
  ValidationError,
} = require("sequelize");

function multerErrorHandler(err) {
  if (err instanceof MulterError) {
    err.code = 400;
  }
}

function sequelizeErrorHandler(err) {
  if (err instanceof BaseError) {
    if (err instanceof UniqueConstraintError) {
      if (err.message.includes("Users_email_key")) {
        err.code = 409;
        err.message = "User with this email already exists";
      }
    }

    if (err instanceof ValidationError) {
      err.code = 400;
    }
  }

  if (
    err.message.includes("Banks_balance_ck") ||
    err.message.includes("Users_balance_ck")
  ) {
    err.message = "Not Enough money";
    err.code = 406;
  }
}

module.exports = (err, req, res, next) => {
  console.log(err);

  multerErrorHandler(err);

  sequelizeErrorHandler(err);

  if (!err.message || (!err.code && !err.status)) {
    res.status(500).send("Server Error");
  } else {
    res.status(err.code || err.status).send(err.message);
  }
};
