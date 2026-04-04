exports.createProduct = async (req, res, next) => {

  try {

    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      product
    });

  } catch (err) {
    next(err);
  }

};