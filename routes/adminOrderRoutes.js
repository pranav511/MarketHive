const express = require("express");

const router = express.Router();

const adminOrderController =
require("../controllers/adminOrderController");

const {
  authenticate,
  checkRole
} = require("../middlewares/authMiddleware");


// ======================================================
// 🔹 GET ALL ORDERS
// ======================================================

router.get(
  "/",
  authenticate,
  checkRole(["admin"]),
  adminOrderController.getAllOrders
);


// ======================================================
// 🔹 UPDATE ORDER STATUS
// ======================================================

router.patch(
  "/:id/status",
  authenticate,
  checkRole(["admin"]),
  adminOrderController.updateOrderStatus
);


router.patch(
  "/:id/shipment",
  authenticate,
  checkRole(["admin"]),
  adminOrderController.updateShipment
);

module.exports = router;
