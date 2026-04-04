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
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!refreshToken) {
      return res.json({ message: "Already logged out" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );
    console.log(decoded);
    

    // remove refresh token
    await redisClient.del(
      `refreshToken:${decoded.id}:${decoded.sessionId}`
    );
    // blacklist access token
    if (accessToken) {

      const decodedAccess = jwt.decode(accessToken);

      const expiry =
        decodedAccess.exp - Math.floor(Date.now() / 1000);

      await redisClient.set(
        `blacklist:${accessToken}`,
        "true",
        { EX: expiry }
      );
    }

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (err) {
    next(err);
  }
};