const bcrypt = require("bcrypt");
const User = require("../models/authModel");
const JWT = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { request } = require("express");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getUser = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

// 1. Register User
const ragister = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already registered"));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000;
  const creatUser = await User.create({
    name,
    email,
    password: hashedPassword,
    otp,
    otpExpire,
    isVerified: false,
  });
  await sendEmail({
    email: creatUser.email,
    subject: "Email Verification Otp",
    message: `Your verification otp is ${otp}. It will expire in 10 minutes`,
  });
  res.status(201).json({
    message: "User Created Successfully",
    User: {
      id: creatUser._id,
      email: creatUser.email,
      role: creatUser.role,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Invalid Email or Password"));
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid Email and Password"));
  }
  const token = accessToken(user);
  const refToken = refreshToken(user);
  user.refreshToken = refToken;
  await user.save();

  res.status(200).json({
    message: "Login Successfully",
    User: {
      accessToken: token,
      refreshToken: refToken,
      id: user._id,
      role: user.role,
    },
  });
});

const refreshAccessToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Require Refresh Token"));
  }
  const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.user);

  if (!user) {
    return next(new AppError("User Not Found"));
  }

  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError("Invalid or Expired Refresh Token"));
  }
  const newAccessToken = accessToken(user);
  res.json({
    accessToken: newAccessToken,
  });
});

const logOut = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return next(new AppError("Require Refresh Token"));
  }
  const decoded = JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  await User.findByIdAndUpdate(decoded.user, {
    refreshToken: null,
  });

  res.json({ message: "Logout Successfully" });
});

const changePassword = catchAsync(async (req, res, next) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const user = await User.findById(req.user);
  if (!user) {
    return next(new AppError("User Not Found"));
  }
  const correctPassword = await bcrypt.compare(oldPassword, user.password);
  if (!correctPassword) {
    return next(new AppError("Old password is incorrect"));
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();
  res.json({ message: "Password Changed Successfully" });
});

// Forgot Password (Sends OTP)
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User Not found"));
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000;

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: "Password Reset Otp",
    message: `Your password reset otp is ${otp}. It will expire in 10 minutes`,
  });

  res.status(200).json({
    message: "Password reset OTP sent successfully to your email.",
    User: {
      id: user._id,
      role: user.role,
    },
  });
});

// Verify Email OTP
const verifiEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
    return next(new AppError("Invalid or Expired Otp"));
  }
  const token = accessToken(user);
  const refToken = refreshToken(user);
  user.isVerified = true;
  user.otp = null;
  user.otpExpire = null;
  user.refreshToken = refToken;
  await user.save();
  res.status(200).json({
    message: "Email Verified Successfully! You are now logged in.",
    User: {
      accessToken: token,
      refreshToken: refToken,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Reset Password (Verifies OTP, Updates Password, & Auto-Logins 🚀)
const resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
    return next(new AppError("Invalid or Expired OTP"));
  }

  // Hash the new password properly
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;
  user.isVerified = true;
  user.otp = null;
  user.otpExpire = null;

  const token = accessToken(user);
  const refToken = refreshToken(user);
  user.refreshToken = refToken;
  await user.save();

  res.status(200).json({
    message: "Password reset successfully! You are now logged in.",
    User: {
      accessToken: token,
      refreshToken: refToken,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = {
  ragister,
  getUser,
  login,
  refreshAccessToken,
  logOut,
  changePassword,
  verifiEmail,
  forgotPassword,
  resetPassword,
};
