const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const validate = require("../middlewares/validate");
const { createCategorySchema, updateCategorySchema } = require("../validators/categoryValidation");
const { authenticate, checkRole } = require("../middlewares/authMiddleware");


// Create Category (Admin only)
router.post(
  "/",
  authenticate,
  validate(createCategorySchema),
  checkRole(["admin"]),
  categoryController.createCategory
);


// Get Categories (Public)
router.get(
  "/",
  categoryController.getCategories
);


// Update Category
router.put(
  "/:id",
  authenticate,
  validate(updateCategorySchema),
  checkRole(["admin"]),
  categoryController.updateCategory
);


// Delete Category
router.delete(
  "/:id",
  authenticate,
  checkRole(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;