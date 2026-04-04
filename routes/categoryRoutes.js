const router = require("express").Router();

const categoryController = require("../controllers/categoryController");
const validate = require("../middlewares/validate");
const verifyAccessToken = require("../middlewares/authorizeRole");
const isAdmin = require("../middlewares/authorizeRole");

const {
  createCategorySchema,
  updateCategorySchema
} = require("../validators/categoryValidation");

// CREATE (Admin)
router.post(
  "/categories",
  verifyAccessToken,
  isAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

// GET (Public)
router.get(
  "/categories",
  categoryController.getCategories
);

// UPDATE (Admin)
router.put(
  "/categories/:id",
  verifyAccessToken,
  isAdmin,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

// DELETE (Admin)
router.delete(
  "/categories/:id",
  verifyAccessToken,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;