const express = require("express");
const AuthRouter = express.Router();

const {
  ragister,
  getUser,
  login,
  refreshAccessToken,
  logOut,
  changePassword,
  verifiEmail,
  forgotPassword,
  resetPassword,
} = require("../controller/AuthController");
const authMiddelware = require("../middelware/AuthMiddelware");

const {
  ragisterSchema,
  resetPasswordSchema,
  verifiEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
} = require("../validaters/authValidaters");
const validate = require("../middelware/validate");

AuthRouter.get("/profile", authMiddelware, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route successfully!",
    user: req.user,
  });
});
AuthRouter.get("/users", getUser);
AuthRouter.post("/register", validate(ragisterSchema), ragister);
AuthRouter.post("/logOut", authMiddelware, logOut);
AuthRouter.post("/refresh-token", refreshAccessToken);
AuthRouter.post("/login", validate(loginSchema), login);
AuthRouter.post("/verifiEmail", validate(verifiEmailSchema), verifiEmail);
AuthRouter.post("/resetPassword", validate(resetPasswordSchema), resetPassword);
AuthRouter.post(
  "/forgotPassword",
  validate(forgotPasswordSchema),
  forgotPassword,
);
AuthRouter.patch(
  "/changePassword",
  authMiddelware,
  validate(changePasswordSchema),
  changePassword,
);

module.exports = AuthRouter;
