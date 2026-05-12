const express = require("express");
const router = express.Router();

const addressController =
require("../controllers/addressController");

const { authenticate } =
require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticate,
  addressController.addAddress
);
router.get(
  "/",
  authenticate,
  addressController.getAddresses
);

router.put(
  "/:id",
  authenticate,
  addressController.updateAddress
);

router.delete(
  "/:id",
  authenticate,
  addressController.deleteAddress
);

router.patch(
  "/default/:id",
  authenticate,
  addressController.setDefaultAddress
);

module.exports = router;