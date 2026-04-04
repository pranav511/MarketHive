const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otp");
const { sendEmailOTP } = require("../utils/emailService");
const { sendSMSOTP } = require("../utils/smsService");
const redisClient = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();

exports.registerUser = async (data) => {

  try {

    const { name, email, password, phone, role } = data;

    // Check duplicate
    const [existing] = await pool.query(
      "SELECT id,email,phone FROM users WHERE email=? OR phone=?",
      [email, phone]
    );

    if (existing.length > 0) {

      if (existing[0].email === email) {
        throw { status: 400, message: "Email already registered" };
      }

      if (existing[0].phone === phone) {
        throw { status: 400, message: "Phone already registered" };
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Insert user (unverified)
    await pool.query(
      `INSERT INTO users 
      (name,email,password,phone,role,otp,otp_expires_at,is_verified) 
      VALUES (?,?,?,?,?,?,?,0)`,
      [name, email, hashedPassword, phone, role || "user", otp, otpExpiresAt]
    );

    // Send OTP
    try {

      await sendEmailOTP(email, otp);
      await sendSMSOTP(phone, otp);

    } catch (err) {

      // rollback user if OTP failed
      await pool.query(
        "DELETE FROM users WHERE email=?",
        [email]
      );

      throw {
        status: 400,
        message: "OTP delivery failed. Enter valid email/phone"
      };
    }

    return { message: "User registered. OTP sent." };

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      throw { status: 400, message: "Email or phone already exists" };
    }

    throw err;
  }
};

exports.verifyOtp = async ({ email, otp }) => {

  const [rows] = await pool.query(
    "SELECT otp, otp_expires_at FROM users WHERE email=?",
    [email]
  );

  if (!rows.length) {
    throw { status: 404, message: "User not found" };
  }

  const user = rows[0];

  if (user.otp !== otp) {
    throw { status: 400, message: "Invalid OTP" };
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    throw { status: 400, message: "OTP expired" };
  }

  await pool.query(
    "UPDATE users SET is_verified=1, otp=NULL, otp_expires_at=NULL WHERE email=?",
    [email]
  );

  return { message: "Account verified successfully" };
};

exports.loginUser = async ({ email, password }) => {

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email=?",
    [email]
  );

  if (!rows.length) {
    throw { status: 400, message: "Invalid email" };
  }

  const user = rows[0];

  const sessionId = uuidv4();

  if (!user.is_verified) {
    throw { status: 400, message: "Account not verified" };
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw { status: 400, message: "Invalid password" };
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, sessionId },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Store refresh token in Redis
  await redisClient.set(
    `refreshToken:${user.id}:${sessionId}`,
    refreshToken,
    { EX: 7 * 24 * 60 * 60 }
  );

  return { accessToken, refreshToken };
};

exports.refreshAccessToken = async (refreshToken) => {

  try {

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );

    const redisKey = `refreshToken:${decoded.id}:${decoded.sessionId}`;

    const storedToken = await redisClient.get(redisKey);

    if (!storedToken || storedToken !== refreshToken) {
      throw { status: 401, message: "Refresh token revoked" };
    }

    // new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role:decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id, sessionId: decoded.sessionId },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // update redis
    await redisClient.set(
      redisKey,
      newRefreshToken,
      { EX: 7 * 24 * 60 * 60 }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (err) {
    throw { status: 401, message: "Invalid refresh token" };
  }

};
