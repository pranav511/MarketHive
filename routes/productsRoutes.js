const router = require("express").Router();
const productController = require("../controllers/productController");
const { authenticate } = require("../middlewares/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

router.post(
  "/products",
  authenticate,
  authorizeRole("admin"),
  productController
);

module.exports = router;