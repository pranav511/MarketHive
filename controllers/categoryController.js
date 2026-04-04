const categoryService = require("../services/categoryService");

// CREATE
exports.createCategory = async (req, res, next) => {
  try {

    const result = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getCategories = async (req, res, next) => {
  try {

    const data = await categoryService.getCategories();

    res.json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateCategory = async (req, res, next) => {
  try {

    const result = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteCategory = async (req, res, next) => {
  try {

    const result = await categoryService.deleteCategory(req.params.id);

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};