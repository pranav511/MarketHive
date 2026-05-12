const categoryService = require("../services/categoryService");

exports.createCategory = async (req, res, next) => {
  try {

    const result = await categoryService.createCategory(
      req.body
    );

    res.status(201).json({
      success: true,
      category: result
    });

  } catch (err) {
    next(err);
  }
};


exports.getCategories = async (req, res, next) => {
  try {

    const result = await categoryService.getCategories();

    res.json({
      success: true,
      categories: result
    });

  } catch (err) {
    next(err);
  }
};


exports.updateCategory = async (req, res, next) => {
  try {

    const result = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};


exports.deleteCategory = async (req, res, next) => {
  try {

    const result = await categoryService.deleteCategory(
      req.params.id
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};