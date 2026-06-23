const express =
require("express");

const router =
express.Router();

const refundController =
require("../controllers/refundController");

const {
  authenticate,
  checkRole
} = require("../middlewares/authMiddleware");


// ======================================================
// 🔹 PROCESS REFUND
// ======================================================

router.post(
  "/:id",
  authenticate,
  checkRole(["admin"]),
  refundController.processRefund
);


module.exports = router;