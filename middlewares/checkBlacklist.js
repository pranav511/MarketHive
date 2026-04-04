const redisClient = require("../config/redis");

const checkBlacklist = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];

    const isBlacklisted = await redisClient.get(
      `blacklist:${token}`
    );

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid. Please login again"
      });
    }

    next();

  } catch (err) {
    next(err);
  }

};

module.exports = checkBlacklist;