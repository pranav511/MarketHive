const productService = require('../services/productService');

exports.createProduct = async (req, res, next) => {
  try {
    if (req.body.variants && typeof req.body.variants === "string") {
      req.body.variants = JSON.parse(req.body.variants);
    }

    const result = await productService.createProduct(
      req.user,
      req.body,
      req.files
    );

    res.status(201).json({
      success: true,
      product: result
    });

  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {

    const products = await productService.getProducts(req.query);

    res.json({
      success: true,
      products
    });

  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {

    const product = await productService.getProductById(
      req.params.id
    );

    res.json({
      success: true,
      product
    });

  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {

    const result = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {

    const result = await productService.deleteProduct(
      req.params.id
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};