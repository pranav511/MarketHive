const jwt = require("jsonwebtoken");
const pool = require('../config/db')

exports.authenticate = async(req, res, next) => {

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

    // Fetch role from DB
    const [user] = await pool.query(
      `SELECT u.id, r.role_name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [decoded.id]
    );

    req.user = user[0];
    // req.user = decoded;

    next();

  } catch (err) {

    next({ status: 401, message: "Invalid or expired token", err:err.message });

  }

};

exports.checkRole = (allowedRoles) => (req, res, next) => {  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

exports.checkOwnership = async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id;

  const [rows] = await pool.query(
    'SELECT owner_id FROM products WHERE id=?',
    [productId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (req.user.role !== 'admin' && rows[0].owner_id !== userId) {
    return res.status(403).json({ message: 'Forbidden: not owner' });
  }

  next();
};