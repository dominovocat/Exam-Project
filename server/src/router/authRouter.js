const { Router } = require("express");
const validators = require("../middlewares/validators");
const userController = require("../controllers/userController");
const { checkRefreshToken } = require("../middlewares/checkToken");

const authRouter = Router();

// path /auth/registration
authRouter.post(
  "/registration",
  validators.validateRegistrationData,
  userController.registration
);

// path /auth/login
authRouter.post("/login", validators.validateLogin, userController.login);

// path /auth/refresh
authRouter.put("/refresh", checkRefreshToken, userController.refreshSession);

module.exports = authRouter;
