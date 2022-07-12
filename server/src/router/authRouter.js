const { Router } = require("express");
const validators = require("../middlewares/validators");
const userController = require("../controllers/userController");

const authRouter = Router();

// path /auth/registration
authRouter.post(
  "/registration",
  validators.validateRegistrationData,
  userController.registration
);

authRouter.post("/login", validators.validateLogin, userController.login);

module.exports = authRouter;
