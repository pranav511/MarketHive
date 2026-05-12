// routes/orderRoutes.js

const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post(
  "/preview",
  authenticate,
  orderController.preview
);

router.post(
  "/create",
  authenticate,
  orderController.createOrder
);

router.get(
  "/my-orders",
  authenticate,
  orderController.getMyOrders
);

router.get(
  "/:id",
  authenticate,
  orderController.getOrderDetails
);

router.patch(
  "/cancel/:id",
  authenticate,
  orderController.cancelOrder
);

module.exports = router;