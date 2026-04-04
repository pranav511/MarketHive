const express = require("express");
const router = express.Router();

const { register, verifyOtp, login, refreshToken, logout } = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { registerSchema, verifyOtpSchema, loginSchema } = require("../validators/authValidator");
const loginLimiter = require("../middlewares/loginLimiter");

router.post(
"/register",
  validate(registerSchema), 
  register);

router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  verifyOtp
);

router.post(
  "/login",
  validate(loginSchema),
  loginLimiter,
  login
);


router.post(
   "/refresh-token", 
   refreshToken
);

router.post(
   "/logout", 
   logout
);

module.exports = router;