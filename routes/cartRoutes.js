const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const { authenticate } = require("../middlewares/authMiddleware");


router.post(
  "/",
  authenticate,
  cartController.addToCart
);

router.get(
  "/",
  authenticate,
  cartController.getCart
);

router.put(
  "/:id",
  authenticate,
  cartController.updateCart
);

router.delete(
  "/clear",
  authenticate,
  cartController.clearCart
);

router.delete(
  "/:id",
  authenticate,
  cartController.removeItem
);


module.exports = router;