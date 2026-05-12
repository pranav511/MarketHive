const authService = require("../services/authService");
const jwt = require("jsonwebtoken")
const redisClient = require("../config/redis");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {

  try {

    const result = await authService.verifyOtp(req.body);

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }

};

exports.login = async (req, res, next) => {

  try {

    const { accessToken, refreshToken } =
      await authService.loginUser(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken
    });

  } catch (err) {
    next(err);
  }

};

exports.refreshToken = async (req, res, next) => {

  try {

    const refreshToken = req.cookies.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken
    });

  } catch (err) {
    next(err);
  }

};


exports.logout = async (req, res, next) => {
  try {

    const refreshToken = req.cookies.refreshToken;

    const authHeader = req.headers.authorization;
    const accessToken =
      authHeader && authHeader.split(" ")[1];

    const result =
      await authService.logoutUser(
        refreshToken,
        accessToken
      );

    res.clearCookie("refreshToken");

    res.json(result);

  } catch (err) {
    next(err);
  }
};