const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next({ status: 401, message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next({ status: 401, message: "Access token missing" });
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    next({ status: 401, message: "Invalid or expired token" });

  }

};